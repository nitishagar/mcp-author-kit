# mcp-author-kit

Scaffold, grade, test, and debug MCP (Model Context Protocol) servers from inside Cursor.

> Status: **early development (v0.2.0 in progress)**. Not yet published to the Cursor marketplace.

## What's in the box

- **Skills** (`skills/`) — agent guidance for scaffolding, designing, testing, and debugging MCP servers.
- **Templates** (`templates/`) — ready-to-clone Python (stdio) and TypeScript (Cloudflare Workers) starter projects.
- **MCP utility server** (`server/`) — a bundled MCP server that exposes:
  - `inspect_mcp_server` — boot a target server and enumerate its tools, resources, and prompts.
  - `call_mcp_tool` — exercise a tool on a target server.
  - `grade_tool_description` — rule-based scoring of tool definitions, plus an optional LLM clarity pass.
  - `generate_smoke_tests` — produce a starter test plan for a target server.
  - `tail_mcp_logs` — capture stderr and structured events from a target server.

## Development

```bash
pnpm install
pnpm test
pnpm build
```

Requires Node 20+.

## License

MIT — see [LICENSE](./LICENSE).
