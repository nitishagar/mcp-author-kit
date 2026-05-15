# mcp-author-kit

Scaffold, grade, test, and debug MCP (Model Context Protocol) servers from inside Cursor.

> Status: **early development (v0.2.0 in progress)**. Not yet published to the Cursor marketplace.

## What's in the box

- **Skills** (`skills/`) — five agent skills covering scaffolding, designing, testing, and debugging MCP servers:
  - `scaffolding-mcp-server-python` — copy the Python stdio template into a workspace and bring it to a green smoke test.
  - `scaffolding-mcp-server-typescript` — same shape, TypeScript starter.
  - `designing-mcp-tool-descriptions` — rubric-driven loop to fix tool descriptions until they score ≥ 85.
  - `testing-mcp-server-locally` — five-step end-to-end smoke test using the bundled tools.
  - `debugging-mcp-server` — triage failing servers via stderr capture, schema introspection, malformed inputs.
- **Templates** (`templates/`) — minimal, bootable starters:
  - `python-stdio` — `pyproject.toml` + `__main__.py` with a working `echo` tool and stderr-safe logging.
  - `typescript-cf-workers` — Node-stdio TS starter with the same shape; Workers deploy is a follow-on.
- **MCP utility server** (`server/`) — a bundled MCP server that exposes:
  - `inspect_mcp_server` ✅ — boot a target server and enumerate its tools, resources, and prompts.
  - `grade_tool_description` ✅ — rule-based scoring of tool definitions (LLM clarity pass deferred to v0.2.1).
  - `tail_mcp_logs` ✅ — capture stderr from a target server for a fixed duration window.
  - `call_mcp_tool` ✅ — invoke a single tool on a target server with timing data.
  - `generate_smoke_tests` ✅ — produce a markdown smoke-test plan from inspect + rubric.
- **Slash command** (`commands/test-mcp.md`) — `/test-mcp` runs the full inspect → grade → smoke-plan flow and prints a one-screen report.

## Development

```bash
pnpm install
pnpm test
pnpm build
```

Requires Node 20+.

## License

MIT — see [LICENSE](./LICENSE).
