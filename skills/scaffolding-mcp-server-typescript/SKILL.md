---
name: scaffolding-mcp-server-typescript
description: Stand up a new TypeScript MCP server from a working starter template (Cloudflare Workers + stdio for local dev).
trigger: Use when the user asks for a new TypeScript or JavaScript MCP server, mentions Cloudflare Workers + MCP, or wants to expose tools to Cursor from a Node project.
do_not_use: Do not use to add a tool to an existing TS server — edit `src/tools/` directly. Do not use for Python or other languages.
---

# Scaffolding a TypeScript MCP server

When this skill applies, copy `templates/typescript-cf-workers/` into the user's workspace and bring it to a green smoke test in five steps.

1. **Choose a directory.** Default to the current working directory; abort and ask if a `package.json` already exists.
2. **Copy the template.** `cp -R <plugin-root>/templates/typescript-cf-workers/. <target>/` and rename `your-mcp-server` in `package.json` and `wrangler.toml` to the user's chosen name.
3. **Install.** `pnpm install` (or `npm install`). Verify Node ≥ 20.
4. **Smoke test the server.** Build with `pnpm build`, then run `inspect_mcp_server` with `command="node"` and `args=["./dist/index.js"]`. Expect ≥ 1 tool, 0 warnings.
5. **Grade the starter tool.** For every tool returned in step 4, call `grade_tool_description`. Fix anything scoring < 85 before moving on.

## What "done" looks like

- `inspect_mcp_server` returns a non-empty `tools` array.
- Every tool scores ≥ 85 from `grade_tool_description`.
- README documents both local stdio and Workers deployment paths.

## Common pitfalls

- Importing CommonJS-only packages — the template is ESM (`"type": "module"`). Stick to ESM packages or use dynamic `import()`.
- Logging to stdout — corrupts MCP framing. Use `console.error` only.
- Forgetting `wrangler.toml` updates when renaming the project — Workers will deploy under the wrong name otherwise.
