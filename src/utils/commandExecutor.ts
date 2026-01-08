import { spawn } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { Logger } from "./logger.js";

/**
 * Get additional PATH entries for Windows npm/node locations.
 * The MCP server may not inherit standard user PATH entries.
 * Supports: standard Node.js, nvm-windows (coreybutler), nvm4windows, and custom installations.
 */
function getWindowsNodePaths(): string[] {
  const paths: string[] = [];
  const appData = process.env.APPDATA;
  const localAppData = process.env.LOCALAPPDATA;
  const userProfile = process.env.USERPROFILE;

  // nvm4windows / nvm-windows environment variables
  const nvmHome = process.env.NVM_HOME;
  const nvmSymlink = process.env.NVM_SYMLINK;

  Logger.debug(`Platform: ${process.platform}, NVM_HOME: ${nvmHome}, NVM_SYMLINK: ${nvmSymlink}`);

  // Priority 1: NVM_SYMLINK - the active Node.js version symlink (fastest lookup)
  if (nvmSymlink) {
    paths.push(nvmSymlink);
    Logger.debug(`Added NVM_SYMLINK path: ${nvmSymlink}`);
  }

  // Priority 2: NVM_HOME - search for installed versions
  if (nvmHome) {
    // Add common/recent Node.js LTS versions
    const commonVersions = ['v24.12.0', 'v22.21.1', 'v22.12.0', 'v20.18.0', 'v20.10.0', 'v18.20.0', 'v18.19.0'];
    for (const v of commonVersions) {
      paths.push(join(nvmHome, v));
    }
    Logger.debug(`Added NVM_HOME version paths from: ${nvmHome}`);
  }

  // Priority 3: Add npm global path
  if (appData) {
    paths.push(join(appData, 'npm'));
  }

  // Priority 4: Fallback to LOCALAPPDATA nvm location (older nvm-windows default)
  if (localAppData && !nvmHome) {
    const nvmDir = join(localAppData, 'nvm');
    const commonVersions = ['v24.12.0', 'v22.21.1', 'v22.12.0', 'v20.18.0', 'v20.10.0', 'v18.20.0', 'v18.19.0'];
    for (const v of commonVersions) {
      paths.push(join(nvmDir, v));
    }
  }

  // Priority 5: Standard Node.js installation paths
  paths.push('C:\\Program Files\\nodejs');
  paths.push('C:\\Program Files (x86)\\nodejs');

  Logger.debug(`Final Windows node paths: ${paths.join(';')}`);
  return paths;
}

/**
 * Resolve npm global command to full path on Windows.
 * Checks common npm global bin locations since MCP server may not have them in PATH.
 */
function resolveNpmCommand(command: string): string {
  if (process.platform !== 'win32') return command;

  const cmdFile = `${command}.cmd`;
  const searchPaths = getWindowsNodePaths().map(p => join(p, cmdFile));

  for (const fullPath of searchPaths) {
    if (existsSync(fullPath)) {
      Logger.debug(`Resolved ${command} to ${fullPath}`);
      return fullPath;
    }
  }

  // Return original command if not found (will fail with clear error)
  return command;
}

export async function executeCommand(
  command: string,
  args: string[],
  onProgress?: (newOutput: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    Logger.commandExecution(command, args, startTime);

    // Windows-compatible command execution
    let spawnCommand = command;
    let spawnArgs = args;
    let useShell = false;

    if (process.platform === 'win32') {
      // Use cmd.exe to execute commands on Windows
      // Use full path to cmd.exe since MCP server environment may not have System32 in PATH
      const cmdPath = process.env.COMSPEC || 'C:\\Windows\\System32\\cmd.exe';
      spawnCommand = cmdPath;

      if (!command.includes('.') && !command.includes('\\') && !command.includes('/')) {
        // For simple command names (like "gemini"), resolve to full path
        const resolvedCommand = resolveNpmCommand(command);
        if (resolvedCommand !== command) {
          // Found full path - use it directly
          spawnArgs = ['/c', resolvedCommand, ...args];
        } else {
          // Not found - try with .cmd extension (may work if in PATH)
          spawnArgs = ['/c', command + '.cmd', ...args];
        }
      } else {
        // Command already has path or extension
        spawnArgs = ['/c', command, ...args];
      }
    }

    // Build environment with additional PATH entries for Windows
    // Check multiple indicators for Windows (platform detection may be unreliable in MCP)
    const isWindows = process.platform === 'win32' ||
                      !!process.env.COMSPEC ||
                      !!process.env.SYSTEMROOT ||
                      !!process.env.WINDIR;

    let spawnEnv = { ...process.env };
    if (isWindows) {
      const additionalPaths = getWindowsNodePaths();
      Logger.debug(`isWindows: ${isWindows}, additionalPaths count: ${additionalPaths.length}`);
      if (additionalPaths.length > 0) {
        // Windows PATH can be 'Path' or 'PATH' - handle both
        const currentPath = process.env.PATH || process.env.Path || '';
        const newPath = additionalPaths.join(';') + ';' + currentPath;
        // Set both variations to be safe
        spawnEnv.PATH = newPath;
        spawnEnv.Path = newPath;
        Logger.debug(`Setting PATH to: ${newPath.substring(0, 200)}...`);
      }
    }

    const childProcess = spawn(spawnCommand, spawnArgs, {
      env: spawnEnv,
      shell: useShell,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let isResolved = false;
    let lastReportedLength = 0;
    
    childProcess.stdout.on("data", (data) => {
      stdout += data.toString();
      
      // Report new content if callback provided
      if (onProgress && stdout.length > lastReportedLength) {
        const newContent = stdout.substring(lastReportedLength);
        lastReportedLength = stdout.length;
        onProgress(newContent);
      }
    });


    // CLI level errors
    childProcess.stderr.on("data", (data) => {
      stderr += data.toString();
      // find RESOURCE_EXHAUSTED when gemini-2.5-pro quota is exceeded
      if (stderr.includes("RESOURCE_EXHAUSTED")) {
        const modelMatch = stderr.match(/Quota exceeded for quota metric '([^']+)'/);
        const statusMatch = stderr.match(/status["\s]*[:=]\s*(\d+)/);
        const reasonMatch = stderr.match(/"reason":\s*"([^"]+)"/);
        const model = modelMatch ? modelMatch[1] : "Unknown Model";
        const status = statusMatch ? statusMatch[1] : "429";
        const reason = reasonMatch ? reasonMatch[1] : "rateLimitExceeded";
        const errorJson = {
          error: {
            code: parseInt(status),
            message: `GMCPT: --> Quota exceeded for ${model}`,
            details: {
              model: model,
              reason: reason,
              statusText: "Too Many Requests -- > try using gemini-2.5-flash by asking",
            }
          }
        };
        Logger.error(`Gemini Quota Error: ${JSON.stringify(errorJson, null, 2)}`);
      }
    });
    childProcess.on("error", (error) => {
      if (!isResolved) {
        isResolved = true;
        Logger.error(`Process error:`, error);
        reject(new Error(`Failed to spawn command: ${error.message}`));
      }
    });
    childProcess.on("close", (code) => {
      if (!isResolved) {
        isResolved = true;
        if (code === 0) {
          Logger.commandComplete(startTime, code, stdout.length);
          resolve(stdout.trim());
        } else {
          Logger.commandComplete(startTime, code);
          Logger.error(`Failed with exit code ${code}`);
          const errorMessage = stderr.trim() || "Unknown error";
          reject(
            new Error(`Command failed with exit code ${code}: ${errorMessage}`),
          );
        }
      }
    });
  });
}