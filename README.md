# Gemini MCP Ultimate

<div align="center">

![Gemini MCP Ultimate](https://img.shields.io/badge/Gemini_MCP-Ultimate-886FBF?style=for-the-badge&logo=googlegemini&logoColor=white)
![Version](https://img.shields.io/badge/Version-2.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**The Ultimate Model Context Protocol (MCP) Server for Gemini CLI**
*Supercharge your LLM with Google's Gemini Pro, massive context windows, and persistent sessions.*

</div>

---

## 🚀 Overview

**Gemini MCP Ultimate** is a powerful bridge between your AI assistant (like Claude, Cursor, or any MCP client) and the [Google Gemini CLI](https://github.com/google-gemini/gemini-cli).

Unlike standard tools that just "ask a question," this server turns Gemini into a **persistent co-pilot**. It allows you to:
*   🧠 **Save Tokens**: Offload massive files (1M+ tokens) to Gemini sessions and query them cheaply.
*   🔄 **Maintain Context**: Have continuous, multi-turn conversations with Gemini.
*   🛠️ **Manage Extensions**: Install and control Gemini CLI extensions directly from your chat.
*   ⚡ **Automate Workflows**: Use "YOLO" mode or fine-grained permissions for autonomous coding.

## 🌟 Key Features

### 1. Token Conservation Strategy (The "External Memory" Pattern)
Stop wasting your primary LLM's context window on reading the same documentation over and over.
1.  **Ingest**: Send a 500-page manual to Gemini *once* (`ask-gemini` with a new session).
2.  **Query**: Ask Claude to specific questions about it.
3.  **Retrieve**: Claude asks Gemini (referencing the `session_id`), Gemini searches its memory, and returns *only* the relevant answer.
**Result**: You pay for the answer, not the 500 pages, every single turn.

### 2. Full Autonomy Control
*   **Default Mode**: Safely asks for permission before acting.
*   **Auto-Edit**: Allows file edits but confirms shell commands.
*   **YOLO Mode**: Full autonomy for trusted tasks.
*   **Allowed Tools**: Whitelist specific tools (e.g., allow `ls` and `read_file` but block `rm`).

### 3. Session & Extension Management
*   List and resume past conversations.
*   Install community extensions to expand capabilities.
*   Clean up old sessions to keep your workspace tidy.

---

## 📦 Installation

### Prerequisites
1.  **Node.js** (v16+)
2.  **Gemini CLI** installed and configured (`npm i -g @google/gemini-cli`)

### Quick Start (Claude Code / Desktop)

```bash
claude mcp add gemini-ultimate -- npx -y gemini-mcp-ultimate
```

### Manual Configuration
Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gemini-ultimate": {
      "command": "npx",
      "args": ["-y", "gemini-mcp-ultimate"]
    }
  }
}
```

---

## 🛠️ Tools Reference

### `ask-gemini`
The core tool for interacting with Gemini.
*   **prompt**: The query (use `@filename` to include context).
*   **session_id**: (Optional) Resume a specific conversation (maps to `--resume`).
*   **model**: Default: `gemini-3-pro-preview`.
*   **approval_mode**: `default`, `auto_edit`, or `yolo`.
*   **allowed_tools**: Array of specific tools to allow (e.g., `["ls", "read_file"]`).
*   **include_directories**: Add external context directories.
*   **experimental_acp**: Enable Agentic Coding Protocol mode.
*   **output_format**: `text`, `json`, or `stream-json`.

### `manage-sessions`
Control your conversation history.
*   **action**: `list` (default) or `delete`.
*   **session_id**: Required for deletion.

### `manage-extensions`
Install and manage Gemini CLI capabilities.
*   **action**: `list`, `install`, `uninstall`, `update`, `enable`, `disable`, `validate`.
*   **target**: Extension name or URL.

### `brainstorm`
A specialized ideation tool using frameworks like SCAMPER or Design Thinking.

---

## 💡 Usage Examples

### 1. The Token-Saving Workflow
**User**: "Claude, I want to analyze this entire library, but it's huge. Let's use Gemini."

**Claude**:
1.  Calls `ask-gemini(prompt="@src/lib explain the architecture", session_id="new")`.
2.  Gemini creates **Session #123** and returns a summary.
3.  **User**: "How does the auth module work?"
4.  Claude Calls `ask-gemini(prompt="Focus on auth module details", session_id="123")`.
    *   *Note: Claude did NOT re-send the files. Gemini remembered them.*

### 2. Autonomous Refactoring
**User**: "Fix all the linter errors in src/utils."

**Claude**:
Calls `ask-gemini(prompt="Fix linter errors in @src/utils", approval_mode="auto_edit")`.
*   Gemini fixes the files directly. Claude confirms the result.

### 3. Installing Extensions
**User**: "Install the conductor extension."

**Claude**:
Calls `manage-extensions(action="install", target="conductor")`.

---

## 📜 License
MIT