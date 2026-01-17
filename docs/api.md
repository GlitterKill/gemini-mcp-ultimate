# API Reference

## Tools

### `ask-gemini`

The primary interface for interacting with the Google Gemini CLI.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `prompt` | string | (Required) | The analysis request or question. Supports `@filename` syntax. |
| `model` | string | `gemini-3-pro-preview` | The specific Gemini model to use. |
| `session_id` | string/number | - | The ID or index of a session to resume. Maps to `--resume`. |
| `approval_mode` | enum | `yolo` | Autonomy level: `default`, `auto_edit`, `yolo`. |
| `include_directories` | array | - | List of additional directories to include in context. |
| `output_format` | enum | `text` | Response format: `text`, `json`, `stream-json`. |
| `experimental_acp` | boolean | false | Enable Agentic Coding Protocol mode. |
| `allowed_tools` | array | - | Specific tools to allow without confirmation. |
| `sandbox` | boolean | false | Run in isolated sandbox mode. |
| `changeMode` | boolean | false | Enable structured edit generation (OLD/NEW format). |

### `manage-sessions`

Manage conversation sessions to handle context and memory.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `action` | enum | `list` | Action to perform: `list` or `delete`. |
| `session_id` | string | - | Required for `delete` action. |

### `manage-extensions`

Manage the capabilities of the Gemini CLI.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `action` | enum | - | `list`, `install`, `uninstall`, `update`, `enable`, `disable`, `validate`. |
| `target` | string | - | Extension name, path, or URL (Required for most actions). |
| `all` | boolean | false | Update all extensions (only for `update`). |
| `scope` | string | - | Scope for enable/disable (`project` or `global`). |

### `brainstorm`

A specialized tool for creative ideation.

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `prompt` | string | (Required) | The core challenge or topic. |
| `methodology` | enum | `auto` | Framework: `scamper`, `design-thinking`, `lateral`, etc. |
| `domain` | string | - | Context domain (e.g., "Software Engineering"). |
| `ideaCount` | number | 12 | Number of ideas to generate. |

---

## Constants

### Models
*   **Pro**: `gemini-3-pro-preview`
*   **Flash**: `gemini-3-flash-preview`

### Errors
*   `QUOTA_EXCEEDED`: Automatically falls back to Flash model.