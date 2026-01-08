import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executeCommand } from '../utils/commandExecutor.js';
import { CLI } from '../constants.js';

const manageSessionsArgsSchema = z.object({
  action: z.enum(['list', 'delete']).default('list').describe("Action to perform: 'list' active sessions or 'delete' a specific session"),
  session_id: z.string().optional().describe("Session ID or index to delete (required for 'delete' action)"),
});

export const manageSessionsTool: UnifiedTool = {
  name: "manage-sessions",
  description: "Manage conversation sessions: list active sessions or delete old ones.",
  zodSchema: manageSessionsArgsSchema,
  category: 'gemini',
  execute: async (args, onProgress) => {
    const action = args.action as string;
    const session_id = args.session_id as string | undefined;

    if (action === 'delete') {
      if (!session_id) {
        throw new Error("session_id is required for delete action");
      }
      return await executeCommand(CLI.COMMANDS.GEMINI, ['--delete-session', session_id], onProgress);
    }

    // Default to list
    return await executeCommand(CLI.COMMANDS.GEMINI, ['--list-sessions'], onProgress);
  }
};