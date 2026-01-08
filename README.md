# Gemini MCP Ultimate

<div align="center">

![Gemini MCP Ultimate](https://img.shields.io/badge/Gemini_MCP-Ultimate-886FBF?style=for-the-badge&logo=googlegemini&logoColor=white)
![Version](https://img.shields.io/badge/Version-2.0.1-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey?style=for-the-badge)

**The Ultimate Model Context Protocol (MCP) Server for Gemini CLI**

*Supercharge Claude with Google's Gemini Pro, massive context windows, and persistent sessions.*

</div>

---

## Why Use This?

**Problem**: Claude's context window costs tokens. Reading a 50,000-line codebase repeatedly burns through your API budget.

**Solution**: Offload large file analysis to Gemini's 1M+ token context window. Claude asks questions, Gemini searches its memory, you pay only for the answers.

| Scenario | Without Gemini MCP | With Gemini MCP | Savings |
|----------|-------------------|-----------------|---------|
| Analyze 10,000-line codebase | ~40,000 tokens/query | ~500 tokens/query | **98%** |
| Review 500-page documentation | ~200,000 tokens/query | ~1,000 tokens/query | **99.5%** |
| Multi-file refactoring | Re-read all files each turn | Query existing session | **90%+** |

---

## Table of Contents

- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Quick Install](#quick-install)
  - [Platform-Specific Instructions](#platform-specific-instructions)
  - [Verify Installation](#verify-installation)
- [Token Savings Examples](#token-savings-examples)
- [Tools Reference](#tools-reference)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Windows Compatibility](#windows-compatibility)
- [License](#license)

---

## Installation

### Prerequisites

| Requirement | Version | Installation |
|------------|---------|--------------|
| Node.js | v18+ (v16 minimum) | [nodejs.org](https://nodejs.org/) |
| Gemini CLI | Latest | `npm install -g @google/gemini-cli` |
| Google Account | - | Required for Gemini authentication |

### Quick Install

**For Claude Code (CLI):**
```bash
claude mcp add gemini-mcp-ultimate -- npx -y gemini-mcp-ultimate
```

**For Claude Desktop:**

Add to your MCP configuration file:

| Platform | Configuration File Location |
|----------|----------------------------|
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "gemini-mcp-ultimate": {
      "command": "npx",
      "args": ["-y", "gemini-mcp-ultimate"]
    }
  }
}
```

### Platform-Specific Instructions

#### Linux / macOS

1. **Install Node.js** (if not already installed):
   ```bash
   # Using nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 20
   nvm use 20
   ```

2. **Install Gemini CLI globally:**
   ```bash
   npm install -g @google/gemini-cli
   ```

3. **Authenticate with Gemini:**
   ```bash
   gemini
   # Follow the browser prompts to sign in with your Google account
   ```

4. **Add the MCP server:**
   ```bash
   claude mcp add gemini-mcp-ultimate -- npx -y gemini-mcp-ultimate
   ```

5. **Restart Claude Code** to load the new MCP server.

#### Windows

> **Important**: Use **PowerShell** for all Windows commands, not Command Prompt (cmd.exe). PowerShell properly preserves system PATH and environment variables that the MCP server needs to locate Gemini.

Windows requires additional PATH configuration because MCP servers run in an isolated environment that may not inherit your user PATH.

1. **Open PowerShell** (not Command Prompt):
   - Press `Win + X` and select "Windows PowerShell" or "Terminal"
   - Or search for "PowerShell" in the Start menu
   - **Do not use** `cmd.exe` as it may not have the correct PATH

2. **Install Node.js:**
   - Download from [nodejs.org](https://nodejs.org/) (LTS recommended)
   - Or use [nvm-windows](https://github.com/coreybutler/nvm-windows):
     ```powershell
     # After installing nvm-windows
     nvm install 20
     nvm use 20
     ```

3. **Install Gemini CLI globally** (in PowerShell):
   ```powershell
   npm install -g @google/gemini-cli
   ```

4. **Authenticate with Gemini** (in PowerShell):
   ```powershell
   gemini
   # Follow the browser prompts to sign in with your Google account
   ```

5. **Verify Gemini is accessible** (in PowerShell):
   ```powershell
   # Check that gemini.cmd exists in your npm global path
   Get-Command gemini
   # Should output the path, e.g.: C:\Users\YourName\AppData\Roaming\npm\gemini.cmd

   # Alternative using where.exe
   where.exe gemini
   ```

6. **Verify environment variables are set** (important for nvm-windows users):
   ```powershell
   # Check these are set correctly
   $env:PATH -split ';' | Where-Object { $_ -match 'node|npm|nvm' }

   # For nvm-windows users, verify these exist:
   echo $env:NVM_HOME
   echo $env:NVM_SYMLINK
   ```

7. **Add the MCP server** (in PowerShell):
   ```powershell
   claude mcp add gemini-mcp-ultimate -- npx -y gemini-mcp-ultimate
   ```

8. **Restart Claude Code** to load the new MCP server.

9. **If the MCP server cannot find Gemini**, see [Windows Troubleshooting](#windows-troubleshooting) below.

### Verify Installation

After installation, verify the MCP server is working:

1. Open Claude Code or Claude Desktop
2. Type `/mcp` to see connected servers
3. You should see `gemini-mcp-ultimate` listed
4. Test with: "Use Gemini to tell me what 2+2 equals"

---

## Token Savings Examples

### Example 1: Codebase Analysis

**Scenario**: Analyze a React application with 15,000 lines of code across 50 files.

**Without Gemini MCP (Traditional approach):**
```
User: "Explain the authentication flow in this codebase"
Claude: [Reads 50 files = ~60,000 tokens input]
Claude: [Generates response = ~2,000 tokens output]
Total: ~62,000 tokens per question
```

**With Gemini MCP:**
```
# First query - Gemini ingests the codebase once
User: "Ask Gemini to analyze @src/ and explain the authentication flow"
Claude: [Calls ask-gemini tool = ~200 tokens]
Gemini: [Reads files into its 1M context, returns summary = ~1,500 tokens returned]
Total first query: ~1,700 tokens

# Subsequent queries - No file re-reading
User: "What middleware is used for auth?"
Claude: [Calls ask-gemini with session_id = ~150 tokens]
Gemini: [Queries existing context, returns answer = ~500 tokens]
Total: ~650 tokens per follow-up
```

**Token Savings:**
| Query | Traditional | With Gemini MCP | Savings |
|-------|------------|-----------------|---------|
| First analysis | 62,000 | 1,700 | 97% |
| Follow-up #1 | 62,000 | 650 | 99% |
| Follow-up #2 | 62,000 | 650 | 99% |
| Follow-up #3 | 62,000 | 650 | 99% |
| **Total (4 queries)** | **248,000** | **3,650** | **98.5%** |

### Example 2: Documentation Review

**Scenario**: Review a 200-page API documentation PDF converted to markdown (~100,000 tokens).

```
# Load documentation into Gemini session
User: "Use Gemini to read @docs/api-reference.md and create a session for questions"

# Query specific endpoints without re-reading
User: "What are the rate limits for the /users endpoint?"
User: "Show me authentication header examples"
User: "What error codes can the /orders endpoint return?"
```

Each follow-up query costs ~500-1,000 tokens instead of ~100,000 tokens.

### Example 3: Multi-File Refactoring

**Scenario**: Refactor error handling across 20 utility files.

```
# Gemini analyzes all files once
User: "Ask Gemini to review @src/utils/*.ts for inconsistent error handling"
Gemini: Returns analysis and patterns found

# Claude applies fixes based on Gemini's analysis
User: "Apply the suggested error handling pattern to all files"
Claude: Uses Gemini's recommendations without re-reading all files
```

---

## Tools Reference

### `ask-gemini`

The primary tool for interacting with Gemini CLI.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | string | required | Your query. Use `@filename` to include files. |
| `model` | string | `gemini-3-pro-preview` | Model to use. Falls back to `gemini-3-flash` on quota errors. |
| `session_id` | string/number | - | Resume a previous session by ID or index. |
| `approval_mode` | string | `yolo` | `default`, `auto_edit`, or `yolo` for autonomy control. |
| `sandbox` | boolean | `false` | Run in isolated sandbox environment. |
| `include_directories` | string[] | - | Additional directories to include in context. |
| `allowed_tools` | string[] | - | Whitelist specific tools Gemini can use. |
| `output_format` | string | `text` | `text`, `json`, or `stream-json`. |
| `changeMode` | boolean | `false` | Return edits in structured OLD/NEW format for Claude to apply. |

**Example prompts:**
```
# Analyze a single file
"@src/index.ts explain the main entry point"

# Analyze multiple files
"@src/auth/*.ts @src/middleware/*.ts how does authentication work?"

# Resume a session
prompt: "What about the error handling?"
session_id: "5"

# Autonomous mode
prompt: "@src/utils/ fix all TypeScript errors"
approval_mode: "auto_edit"
```

### `brainstorm`

Creative ideation using structured frameworks.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | string | required | The challenge or topic to brainstorm. |
| `ideaCount` | number | 12 | Number of ideas to generate. |
| `methodology` | string | `auto` | Framework: `divergent`, `convergent`, `scamper`, `design-thinking`, `lateral`, `auto`. |
| `domain` | string | - | Domain context (e.g., `software`, `business`, `marketing`). |
| `constraints` | string | - | Limitations or requirements to consider. |
| `includeAnalysis` | boolean | `true` | Include feasibility/impact ratings. |

**Example:**
```
prompt: "Ways to reduce API response times"
domain: "software"
methodology: "scamper"
ideaCount: 5
```

### `manage-sessions`

List or delete Gemini conversation sessions.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `action` | string | `list` | `list` or `delete`. |
| `session_id` | string | - | Session ID to delete (required for delete action). |

**Example:**
```
# List all sessions
action: "list"

# Delete a specific session
action: "delete"
session_id: "3"
```

### `manage-extensions`

Install and manage Gemini CLI extensions.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `action` | string | required | `list`, `install`, `uninstall`, `update`, `enable`, `disable`, `validate`. |
| `target` | string | - | Extension name or URL. |
| `scope` | string | `project` | `project` or `global`. |
| `all` | boolean | - | Update all extensions (with `update` action). |

**Example:**
```
# List installed extensions
action: "list"

# Install an extension
action: "install"
target: "conductor"

# Update all extensions
action: "update"
all: true
```

### `ping`

Test connectivity with the MCP server.

```
prompt: "Hello from test"
# Returns: cmd "Hello from test"
```

### `Help`

Display Gemini CLI help information.

```
# No parameters needed
# Returns full Gemini CLI help text
```

---

## Usage Examples

### 1. Basic File Analysis

**User prompt:**
> "Use Gemini to explain what @src/utils/commandExecutor.ts does"

**What happens:**
1. Claude calls `ask-gemini` with the file reference
2. Gemini reads the file and analyzes it
3. Returns explanation to Claude
4. Claude presents the answer

### 2. Multi-Turn Codebase Session

**First query:**
> "Ask Gemini to analyze @src/ and create a session I can query"

**Claude calls:**
```json
{
  "tool": "ask-gemini",
  "prompt": "@src/ analyze this codebase structure and key components"
}
```

**Follow-up (using session):**
> "In that same session, how does error handling work?"

**Claude calls:**
```json
{
  "tool": "ask-gemini",
  "prompt": "Explain the error handling patterns in this codebase",
  "session_id": "latest"
}
```

**Benefit:** The second query doesn't re-read any files. Gemini queries its existing context.

### 3. Autonomous Code Fixes

> "Use Gemini in auto-edit mode to fix all ESLint errors in @src/"

**Claude calls:**
```json
{
  "tool": "ask-gemini",
  "prompt": "@src/ fix all ESLint errors",
  "approval_mode": "auto_edit"
}
```

Gemini fixes files directly without asking for confirmation on each edit.

### 4. Brainstorming Session

> "Brainstorm 5 ways to improve the CLI developer experience using design thinking"

**Claude calls:**
```json
{
  "tool": "brainstorm",
  "prompt": "Ways to improve CLI developer experience",
  "methodology": "design-thinking",
  "ideaCount": 5,
  "domain": "software"
}
```

### 5. Extension Management

> "Install the Gemini security extension"

**Claude calls:**
```json
{
  "tool": "manage-extensions",
  "action": "install",
  "target": "https://github.com/gemini-cli-extensions/security"
}
```

### 6. Session Cleanup

> "List my Gemini sessions and delete the old ones"

**Claude calls:**
```json
{
  "tool": "manage-sessions",
  "action": "list"
}
```

Then for deletion:
```json
{
  "tool": "manage-sessions",
  "action": "delete",
  "session_id": "2"
}
```

---

## Troubleshooting

### General Issues

**MCP server not appearing in `/mcp` list:**
1. Restart Claude Code/Desktop completely
2. Check that Node.js is installed: `node --version`
3. Verify npx works: `npx --version`

**"Gemini command not found" errors:**
1. Install Gemini CLI: `npm install -g @google/gemini-cli`
2. Verify installation: `gemini --version`
3. Re-authenticate: `gemini` (follow prompts)

**Quota exceeded errors:**
- The server automatically falls back from `gemini-3-pro-preview` to `gemini-3-flash`
- You can explicitly request flash: `model: "gemini-3-flash"`

### Windows Troubleshooting

> **Always use PowerShell** for troubleshooting. Command Prompt (cmd.exe) does not properly inherit environment variables.

Windows has unique challenges because:
1. npm global commands are `.cmd` batch files, not executables
2. MCP servers run in isolated environments without user PATH
3. Node.js may be installed via nvm-windows with non-standard paths

**If Gemini cannot be found:**

1. **Open PowerShell and find your Gemini installation:**
   ```powershell
   # Use Get-Command (PowerShell native)
   Get-Command gemini | Select-Object Source

   # Or use where.exe (note the .exe to avoid PowerShell alias)
   where.exe gemini
   # Example output: C:\Users\YourName\AppData\Roaming\npm\gemini.cmd
   ```

2. **Verify your PATH includes npm global directory:**
   ```powershell
   # List PATH entries containing npm or node
   $env:PATH -split ';' | Where-Object { $_ -match 'npm|node|nvm' }

   # Check if npm global bin is in PATH
   $npmGlobal = Join-Path $env:APPDATA 'npm'
   if ($env:PATH -match [regex]::Escape($npmGlobal)) {
       Write-Host "npm global path is in PATH" -ForegroundColor Green
   } else {
       Write-Host "npm global path is NOT in PATH" -ForegroundColor Red
       Write-Host "Add this to your PATH: $npmGlobal"
   }
   ```

3. **Verify NVM environment variables** (if using nvm-windows):
   ```powershell
   # These should both return paths if nvm-windows is configured correctly
   echo "NVM_HOME: $env:NVM_HOME"
   echo "NVM_SYMLINK: $env:NVM_SYMLINK"

   # Verify the symlink points to a valid Node installation
   if ($env:NVM_SYMLINK) {
       Test-Path (Join-Path $env:NVM_SYMLINK 'node.exe')
   }
   ```

4. **The MCP server auto-detects these paths** (in order of priority):
   - `$env:NVM_SYMLINK` (nvm-windows active version symlink)
   - `$env:APPDATA\npm` (standard npm global)
   - `$env:NVM_HOME\vX.X.X` (nvm-windows installed versions)
   - `C:\Program Files\nodejs` (standard Node.js installation)

5. **If auto-detection fails**, install from source in PowerShell:
   ```powershell
   git clone https://github.com/GlitterKill/gemini-mcp-ultimate.git
   cd gemini-mcp-ultimate
   npm install
   npm run build

   # Add with full path (adjust path as needed)
   $fullPath = (Resolve-Path .\dist\index.js).Path
   claude mcp add gemini-local -- node $fullPath
   ```

6. **Verify the MCP server can find Gemini** by checking logs:
   ```powershell
   # Run the MCP server directly to see debug output
   $env:DEBUG = "true"
   node .\dist\index.js
   # Look for "Resolved gemini to..." in the output
   ```

---

## Windows Compatibility

This project includes critical fixes for Windows that are not present in the upstream `gemini-mcp-tool`.

### The Problem

On Unix systems, npm global commands like `gemini` are executable scripts. On Windows, they're `.cmd` batch files (`gemini.cmd`). Node.js `child_process.spawn()` cannot execute `.cmd` files directly without `shell: true`, but using `shell: true` triggers Node.js deprecation warnings and security concerns.

### The Solution

The `commandExecutor.ts` module (`src/utils/commandExecutor.ts:82-116`) implements platform-aware command execution:

**On Windows:**
```javascript
// Uses cmd.exe /c to execute .cmd files
spawnCommand = 'C:\\Windows\\System32\\cmd.exe';
spawnArgs = ['/c', 'gemini.cmd', ...args];
```

**On Linux/macOS:**
```javascript
// Direct execution
spawnCommand = 'gemini';
spawnArgs = args;
```

### Additional Windows Fixes

1. **PATH Environment Injection**: The server adds common Node.js/npm paths to the subprocess environment since MCP servers don't inherit user PATH.

2. **NVM-Windows Support**: Automatically detects `NVM_HOME` and `NVM_SYMLINK` environment variables for users with nvm-windows.

3. **Full Path Resolution**: Searches multiple locations to find `gemini.cmd`:
   - `%NVM_SYMLINK%\gemini.cmd`
   - `%APPDATA%\npm\gemini.cmd`
   - `%NVM_HOME%\vX.X.X\gemini.cmd`
   - `C:\Program Files\nodejs\gemini.cmd`

---

## Development

### Building from Source

```bash
git clone https://github.com/GlitterKill/gemini-mcp-ultimate.git
cd gemini-mcp-ultimate
npm install
npm run build
```

### Running Locally

```bash
# Build and run
npm run dev

# Or just run after building
node dist/index.js
```

### Adding to Claude Code (local development)

```bash
claude mcp add gemini-dev -- node /path/to/gemini-mcp-ultimate/dist/index.js
```

### Project Structure

```
src/
├── index.ts                 # MCP server entry point
├── constants.ts             # Shared constants
├── tools/
│   ├── registry.ts          # Tool registration system
│   ├── ask-gemini.tool.ts   # Main Gemini interface
│   ├── brainstorm.tool.ts   # Brainstorming tool
│   └── ...
└── utils/
    ├── commandExecutor.ts   # Platform-aware process spawning
    ├── geminiExecutor.ts    # Gemini CLI command builder
    └── ...
```

---

## Contributing

Contributions are welcome. Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` to check for errors
5. Submit a pull request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Credits

- Original project: [jamubc/gemini-mcp-tool](https://github.com/jamubc/gemini-mcp-tool)
- Windows compatibility fixes and enhancements by [GlitterKill](https://github.com/GlitterKill)
