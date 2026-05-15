# your-mcp-server (TypeScript / stdio)

A minimal MCP server template scaffolded by `mcp-author-kit`.

> The "cf-workers" name in the directory is aspirational — the template ships with a stdio entrypoint that runs anywhere Node ≥ 20 runs. A `wrangler.toml` for Cloudflare Workers deployment is left as a follow-on once you've validated your tools locally.

## Quick start

```bash
pnpm install
pnpm build
node dist/index.js
```

## Register with Cursor

Add to your `mcp.json`:

```json
{
  "mcpServers": {
    "your-mcp-server": {
      "command": "node",
      "args": ["./dist/index.js"],
      "transport": "stdio"
    }
  }
}
```

## Smoke test

From inside Cursor (with `mcp-author-kit` installed):

> Inspect the MCP server `node ./dist/index.js` and grade every tool description.

You should see one tool (`echo`) with a score ≥ 85.

## Things to remember

- **Never `console.log` from server code** — it corrupts MCP framing on stdout. Use `console.error` instead (already done in the template).
- Add tools by extending the two `setRequestHandler` blocks in `src/index.ts`.
- Run `grade_tool_description` (from `mcp-author-kit`) on every new tool before merging.
