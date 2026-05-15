---
name: scaffolding-mcp-server-python
description: Stand up a new Python MCP server (stdio transport) from a working starter template.
trigger: Use when the user asks for a new Python MCP server, says they want to "build an MCP server in Python", or starts from a blank Python project that should expose MCP tools.
do_not_use: Do not use to add a tool to an existing MCP server — edit the server's tools/ module directly. Do not use for HTTP/SSE servers.
---

# Scaffolding a Python MCP server

When this skill applies, copy the bundled `templates/python-stdio/` template into the user's workspace and bring it to a green smoke test in five steps.

1. **Choose a directory.** Default to the current working directory; if it already contains a `pyproject.toml`, stop and ask the user where to place the new server.
2. **Copy the template.** `cp -R <plugin-root>/templates/python-stdio/. <target>/` and replace the placeholder name `your-mcp-server` in `pyproject.toml` with the user's chosen name.
3. **Install.** `uv sync` (or `pip install -e .` if uv is not available). Verify Python ≥ 3.10.
4. **Smoke test the server.** Run `inspect_mcp_server` with `command="python"` and `args=["-m", "your_mcp_server"]`. Expect at least one tool listed and zero warnings.
5. **Grade the starter tool.** For each tool returned by step 4, call `grade_tool_description`. Walk the user through any issues with score < 85 before moving on.

## What "done" looks like

- `inspect_mcp_server` returns a non-empty `tools` array.
- Every tool scores ≥ 85 from `grade_tool_description`.
- The README in the new project explains how to register the server with Cursor.

## Common pitfalls

- Forgetting `if __name__ == "__main__": asyncio.run(main())` — the template includes it; do not remove.
- Using `print()` instead of writing to stderr — anything on stdout corrupts the MCP framing. The template uses Python's `logging` module configured for stderr.
