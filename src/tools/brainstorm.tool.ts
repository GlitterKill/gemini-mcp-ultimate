import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { Logger } from '../utils/logger.js';
import { executeGeminiCLI } from '../utils/geminiExecutor.js';

function buildBrainstormPrompt(config: {
  prompt: string;
  methodology: string;
  domain?: string;
  constraints?: string;
  existingContext?: string;
  ideaCount: number;
  includeAnalysis: boolean;
}): string {
  const { prompt, methodology, domain, constraints, existingContext, ideaCount, includeAnalysis } = config;
  
  // Select methodology framework
  let frameworkInstructions = getMethodologyInstructions(methodology, domain);
  
  // Build context parts
  const contextParts: string[] = [];
  if (domain) contextParts.push(`Domain: ${domain}`);
  if (constraints) contextParts.push(`Constraints: ${constraints}`);
  if (existingContext) contextParts.push(`Background: ${existingContext}`);

  const contextSection = contextParts.length > 0
    ? `\n\nContext to consider:\n${contextParts.map(p => `- ${p}`).join('\n')}`
    : '';

  const analysisInstructions = includeAnalysis
    ? ' For each idea, also rate Feasibility (1-5), Impact (1-5), and Innovation (1-5), with a one-sentence assessment.'
    : '';

  // Use conversational format to avoid triggering Gemini CLI extensions
  // Keep challenge inline (not on separate line) to prevent conductor extension interception
  let enhancedPrompt = `Please brainstorm ${ideaCount} creative ideas for: "${prompt}"

${frameworkInstructions}${contextSection}

Requirements:
- Each idea must be unique and non-obvious
- Focus on actionable, implementable concepts
- Give each idea a creative name and 2-3 sentence description${analysisInstructions}

Format each idea as: "Idea N: [Name]" followed by the description${includeAnalysis ? ' and ratings' : ''}.`;

  return enhancedPrompt;
}

/**
 * Returns methodology-specific instructions for structured brainstorming
 */
function getMethodologyInstructions(methodology: string, domain?: string): string {
  const methodologies: Record<string, string> = {
    'divergent': `Use Divergent Thinking: Generate maximum quantity of ideas without self-censoring, build on wild ideas, combine unrelated concepts, use "Yes, and..." thinking, postpone evaluation until all ideas are generated.`,

    'convergent': `Use Convergent Thinking: Focus on refining and improving existing concepts, synthesize related ideas into stronger solutions, apply critical evaluation, prioritize by feasibility and impact.`,

    'scamper': `Use SCAMPER triggers: Substitute (what can be replaced?), Combine (what can be merged?), Adapt (from other domains?), Modify (magnify or minimize?), Put to other use, Eliminate (simplify?), Reverse (rearrange?).`,

    'design-thinking': `Use Design Thinking: Empathize with user needs and pain points, define problems from user perspective, ideate user-focused solutions, consider the complete user journey, focus on testable concepts.`,

    'lateral': `Use Lateral Thinking: Make unexpected connections between unrelated fields, challenge fundamental assumptions, use random word association, apply metaphors from other domains, reverse conventional patterns.`,

    'auto': `${domain ? `For the ${domain} domain, combine` : 'Combine'} divergent exploration, SCAMPER triggers, lateral thinking, and human-centered perspective for practical value.`
  };

  return methodologies[methodology] || methodologies['auto'];
}

const brainstormArgsSchema = z.object({
  prompt: z.string().min(1).describe("Primary brainstorming challenge or question to explore"),
  model: z.string().optional().describe("Optional model to use (e.g., 'gemini-2.5-flash'). If not specified, uses the default model (gemini-2.5-pro)."),
  methodology: z.enum(['divergent', 'convergent', 'scamper', 'design-thinking', 'lateral', 'auto']).default('auto').describe("Brainstorming framework: 'divergent' (generate many ideas), 'convergent' (refine existing), 'scamper' (systematic triggers), 'design-thinking' (human-centered), 'lateral' (unexpected connections), 'auto' (AI selects best)"),
  domain: z.string().optional().describe("Domain context for specialized brainstorming (e.g., 'software', 'business', 'creative', 'research', 'product', 'marketing')"),
  constraints: z.string().optional().describe("Known limitations, requirements, or boundaries (budget, time, technical, legal, etc.)"),
  existingContext: z.string().optional().describe("Background information, previous attempts, or current state to build upon"),
  ideaCount: z.number().int().positive().default(12).describe("Target number of ideas to generate (default: 10-15)"),
  includeAnalysis: z.boolean().default(true).describe("Include feasibility, impact, and implementation analysis for generated ideas"),
});

export const brainstormTool: UnifiedTool = {
  name: "brainstorm",
  description: "Generate novel ideas with dynamic context gathering. --> Creative frameworks (SCAMPER, Design Thinking, etc.), domain context integration, idea clustering, feasibility analysis, and iterative refinement.",
  zodSchema: brainstormArgsSchema,
  prompt: {
    description: "Generate structured brainstorming prompt with methodology-driven ideation, domain context integration, and analytical evaluation framework",
  },
  category: 'gemini',
  execute: async (args, onProgress) => {
    const {
      prompt,
      model,
      methodology = 'auto',
      domain,
      constraints,
      existingContext,
      ideaCount = 12,
      includeAnalysis = true
    } = args;

    if (!prompt?.trim()) {
      throw new Error("You must provide a valid brainstorming challenge or question to explore");
    }

    let enhancedPrompt = buildBrainstormPrompt({
      prompt: prompt.trim() as string,
      methodology: methodology as string,
      domain: domain as string | undefined,
      constraints: constraints as string | undefined,
      existingContext: existingContext as string | undefined,
      ideaCount: ideaCount as number,
      includeAnalysis: includeAnalysis as boolean
    });

    Logger.debug(`Brainstorm: Using methodology '${methodology}' for domain '${domain || 'general'}'`);
    
    // Report progress to user
    onProgress?.(`Generating ${ideaCount} ideas via ${methodology} methodology...`);
    
    // Execute with Gemini
    return await executeGeminiCLI(enhancedPrompt, model as string | undefined, false, false, onProgress);
  }
};