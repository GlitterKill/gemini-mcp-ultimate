# Changelog

## [2.0.1] - Windows Compatibility & Documentation

### Fixed
- **Positional Prompts**: Migrated from deprecated `-p` flag to positional prompts for future Gemini CLI compatibility
- **Brainstorm Tool**: Fixed prompt format that was triggering Gemini CLI conductor extension interception
- **Windows PATH Resolution**: Enhanced `commandExecutor.ts` with multi-location PATH search for nvm-windows users

### Changed
- Removed deprecated `PROMPT` constant from CLI flags
- Simplified brainstorm methodology instructions to plain text (removed markdown bold formatting)

### Documentation
- Comprehensive README rewrite with detailed installation instructions
- Platform-specific guides for Windows (PowerShell) and Linux/macOS
- Token savings examples with concrete numbers (98-99% savings demonstrated)
- Complete tools reference with parameter tables
- Windows troubleshooting section with PowerShell diagnostic commands
- Technical explanation of Windows `.cmd` file execution fix

## [2.0.0] - Ultimate Release
- **New Branding**: Renamed to `gemini-mcp-ultimate`.
- **Token Conservation**: Introduced "External Memory" pattern via Sessions.
- **New Tools**:
    - `manage-sessions`: List and delete conversation sessions.
    - `manage-extensions`: Install and control Gemini CLI extensions.
- **Enhanced `ask-gemini`**:
    - `session_id`: Resume conversations.
    - `approval_mode`: Control autonomy (`default`, `auto_edit`, `yolo`).
    - `include_directories`: Target external context.
    - `output_format`: JSON support.
    - `allowed_tools`: Fine-grained permission control.
- **Model Update**: Defaulted to `gemini-3-pro-preview` and `gemini-3-flash`.

## [1.1.3]
- "gemini reads, claude edits"
- Added `changeMode` parameter to ask-gemini tool for structured edit responses using claude edit diff.
- Testing intelligent parsing and chunking for large edit responses (>25k characters). I recommend you provide a focused prompt, although large (2000+) line edits have had success in testing.
- Added structured response format with Analysis, Suggested Changes, and Next Steps sections
- Improved guidance for applying edits using Claude's Edit/MultiEdit tools, avoids reading...
- Testing token limit handling with continuation support for large responses

## [1.1.2]
- Gemini-2.5-pro quota limit exceeded now falls back to gemini-2.5-flash automatically. Unless you ask for pro or flash, it will default to pro.

## [1.1.1]
- Public
- Basic Gemini CLI integration
- Support for file analysis with @ syntax
- Sandbox mode support