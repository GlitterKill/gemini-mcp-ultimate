import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executeGeminiCLI, processChangeModeOutput } from '../utils/geminiExecutor.js';
import { 
  ERROR_MESSAGES, 
  STATUS_MESSAGES
} from '../constants.js';

const askGeminiArgsSchema = z.object({
  prompt: z.string().min(1).describe("Analysis request. Use @ syntax to include files (e.g., '@largefile.js explain what this does') or ask general questions"),
  model: z.string().optional().describe("Optional model to use (e.g., 'gemini-3-flash'). If not specified, uses the default model (gemini-3-pro-preview)."),
  sandbox: z.boolean().default(false).describe("Use sandbox mode (-s flag) to safely test code changes, execute scripts, or run potentially risky operations in an isolated environment"),
  changeMode: z.boolean().default(false).describe("Enable structured change mode - formats prompts to prevent tool errors and returns structured edit suggestions that Claude can apply directly"),
  chunkIndex: z.union([z.number(), z.string()]).optional().describe("Which chunk to return (1-based)"),
  chunkCacheKey: z.string().optional().describe("Optional cache key for continuation"),
  session_id: z.union([z.string(), z.number()]).optional().describe("Session ID or index to resume a previous conversation context (maps to --resume)"),
  approval_mode: z.enum(['default', 'auto_edit', 'yolo']).default('yolo').describe("Autonomy control: 'default' (ask), 'auto_edit' (allow edits), 'yolo' (allow all)"),
  include_directories: z.array(z.string()).optional().describe("Additional directories to include in the workspace context"),
  output_format: z.enum(['text', 'json', 'stream-json']).optional().describe("Output format: 'text' (default), 'json', or 'stream-json'"),
  experimental_acp: z.boolean().optional().describe("Enable experimental ACP (Agentic Coding Protocol) mode"),
  allowed_tools: z.array(z.string()).optional().describe("Specific tools to allow without confirmation (overrides approval_mode)"),
});

export const askGeminiTool: UnifiedTool = {
  name: "ask-gemini",
  description: "model selection [-m], sandbox [-s], and changeMode:boolean for providing edits",
  zodSchema: askGeminiArgsSchema,
  prompt: {
    description: "Execute 'gemini -p <prompt>' to get Gemini AI's response. Supports enhanced change mode for structured edit suggestions.",
  },
  category: 'gemini',
  execute: async (args, onProgress) => {
    const { prompt, model, sandbox, changeMode, chunkIndex, chunkCacheKey, session_id, approval_mode, include_directories, output_format, experimental_acp, allowed_tools } = args; if (!prompt?.trim()) { throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED); }
  
    if (changeMode && chunkIndex && chunkCacheKey) {
      return processChangeModeOutput(
        '', // empty for cache...
        chunkIndex as number,
        chunkCacheKey as string,
        prompt as string
      );
    }
    
    const result = await executeGeminiCLI(
      prompt as string,
      model as string | undefined,
      !!sandbox,
      !!changeMode,
      onProgress,
      session_id as string | number | undefined,
      approval_mode as string | undefined,
      include_directories as string[] | undefined,
      output_format as string | undefined,
      !!experimental_acp,
      allowed_tools as string[] | undefined
    );
    
    if (changeMode) {
      return processChangeModeOutput(
        result,
        args.chunkIndex as number | undefined,
        undefined,
        prompt as string
      );
    }
    return `${STATUS_MESSAGES.GEMINI_RESPONSE}\n${result}`; // changeMode false
  }
};