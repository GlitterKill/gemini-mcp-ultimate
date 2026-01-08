# Token Conservation Strategy: The "External Memory" Pattern

One of the most powerful features of `gemini-mcp-ultimate` is the ability to use Gemini as an "External Memory Bank" for your primary LLM (like Claude or GPT-4).

## The Problem

When working with large codebases or documentation, you often face a dilemma:
1.  **Context Window Limits**: You can't fit the entire project into the prompt.
2.  **Cost**: Even if you can fit it, re-sending 100k+ tokens for every follow-up question is prohibitively expensive and slow.

## The Solution: Sessions

Instead of Claude holding all the context, we offload it to a **Gemini Session**.

### Workflow

1.  **Initial Ingestion (High Cost - Once)**
    *   Claude sends a massive amount of data to Gemini.
    *   `ask-gemini(prompt="@src/legacy_code explain this", session_id="legacy_analysis")`
    *   Gemini processes this and stores the context in a local session file.

2.  **Interactive Querying (Low Cost - Repeated)**
    *   Claude needs to know about a specific function in that legacy code.
    *   Instead of reading the files again, Claude asks Gemini:
    *   `ask-gemini(prompt="How does the calculateTax function handle edge cases?", session_id="legacy_analysis")`
    *   Gemini loads the session (with the file content already "understood") and answers.

### Why this saves tokens
*   **Claude's Input**: Only the short question.
*   **Claude's Output**: Only the specific answer.
*   **Gemini's Input**: The session history is re-loaded, but Gemini Pro's massive context window handles this efficiently, and you aren't paying "Claude Opus" prices for it.

## Best Practices

1.  **Name your sessions**: Use descriptive IDs if possible (though indices work too) to keep track of what context is where.
2.  **One Session per Topic**: Don't pollute a "Database Analysis" session with "Frontend CSS" questions. Start a new session.
3.  **Clean Up**: Use `manage-sessions` to delete sessions when the task is complete to avoid confusion.
