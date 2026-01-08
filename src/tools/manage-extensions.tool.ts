import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executeCommand } from '../utils/commandExecutor.js';
import { CLI } from '../constants.js';

const manageExtensionsArgsSchema = z.object({
  action: z.enum(['list', 'install', 'uninstall', 'update', 'enable', 'disable', 'validate'])
    .describe("The action to perform on extensions."),
  target: z.string().optional()
    .describe("The name, path, or URL of the extension. Required for install, uninstall, enable, disable, update (single), and validate."),
  all: z.boolean().optional()
    .describe("Update all extensions. Only valid with 'update' action."),
  scope: z.string().optional()
    .describe("Scope for enable/disable (e.g. 'project' or 'global'). Defaults to project if omitted."),
});

export const manageExtensionsTool: UnifiedTool = {
  name: "manage-extensions",
  description: "Manage Gemini CLI extensions: list, install, uninstall, update, enable, disable.",
  zodSchema: manageExtensionsArgsSchema,
  category: 'gemini',
  execute: async (args, onProgress) => {
    const action = args.action as string;
    const target = args.target as string | undefined;
    const all = args.all as boolean | undefined;
    const scope = args.scope as string | undefined;

    const commandArgs: string[] = ['extensions', action];

    switch (action) {
      case 'list':
        // No additional args needed
        break;
      case 'install':
        if (!target) throw new Error("Target is required for install action");
        commandArgs.push(target);
        break;
      case 'uninstall':
        if (!target) throw new Error("Target is required for uninstall action");
        commandArgs.push(target);
        break;
      case 'update':
        if (all) {
          commandArgs.push('--all');
        } else if (target) {
          commandArgs.push(target);
        } else {
          // If neither all nor target is specified, it might update all by default or show help,
          // but strict CLI usually expects one. The CLI help said `update [<name>] [--all]`.
          // If user sends neither, we'll assume they might mean all, or let CLI handle it.
          // Best practice: if they didn't specify, maybe default to --all or error?
          // Let's pass nothing and see if CLI updates all or complains.
          // Actually, let's play safe and check if they want to update a specific one.
        }
        break;
      case 'enable':
      case 'disable':
        if (!target) throw new Error(`Target is required for ${action} action`);
        if (scope) commandArgs.push('--scope', scope);
        commandArgs.push(target);
        break;
      case 'validate':
        if (!target) throw new Error("Target is required for validate action");
        commandArgs.push(target);
        break;
    }

    return await executeCommand(CLI.COMMANDS.GEMINI, commandArgs, onProgress);
  }
};
