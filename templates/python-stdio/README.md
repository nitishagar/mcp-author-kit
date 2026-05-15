# your-mcp-server (Python stdio)

A minimal MCP server template scaffolded by `mcp-author-kit`.

## Quick start

```bash
uv sync         # or: python -m venv .venv && source .venv/bin/activate && pip install -e .
python -m your_mcp_server
```

## Register with Cursor

Add to your `mcp.json`:

```json
{
  "mcpServers": {
    "your-mcp-server": {
      "command": "python",
      "args": ["-m", "your_mcp_server"],
      "transport": "stdio"
    }
  }
}
```

## Smoke test

From inside Cursor (with `mcp-author-kit` installed):

> Inspect the MCP server `python -m your_mcp_server` and grade every tool description.

You should see one tool (`echo`) with a score ≥ 85.

## Things to remember

- **Never write to stdout from server code.** stdout is reserved for the MCP framing. Use `logging` (already configured to stderr) or `print(..., file=sys.stderr)`.
- Add tools by extending `list_tools()` and `call_tool()` in `src/your_mcp_server/__main__.py`.
- Run `grade_tool_description` (from `mcp-author-kit`) on every new tool before merging.
