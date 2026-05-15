---
name: debugging-mcp-server
description: Triage a failing or misbehaving MCP server using stderr capture, schema introspection, and deliberate malformed inputs.
trigger: Use when the user reports an MCP server is "not showing up", "failing silently", "returning empty results", or behaving differently between Cursor and a direct invocation.
do_not_use: Do not use as the first response when the server has not been scaffolded yet — use `scaffolding-mcp-server-*` first. Do not use for production observability — this is a local triage skill.
---

# Debugging an MCP server

Most MCP server failures fall into three buckets. Triage in this order; cost-of-finding goes up at each step.

## 1. Look at stderr first (`tail_mcp_logs`)

The Cursor host UI swallows the server's stderr. ~70% of "my server isn't working" reports turn out to be a clear Python or Node error in the first five seconds of stderr.

- Call `tail_mcp_logs` with `duration_seconds=2` and the same `command` / `args` Cursor would use.
- Read the stderr verbatim. Stack traces from Python and "TypeError: Cannot read property" lines from Node show up here.

## 2. Schema and transport (`inspect_mcp_server`)

If stderr is clean but the server still misbehaves, the issue is usually in tool registration or the initialize handshake.

- Call `inspect_mcp_server`. If `serverInfo` is null, the handshake never completed.
- If `tools` is empty, the server registered no tools.
- If `warnings[]` is non-empty, the server declared a capability it cannot serve (resources/prompts).

## 3. Error handling (`call_mcp_tool` with malformed inputs)

If the surface looks correct but tool calls fail in subtle ways:

- Call each tool with a missing required field. The server should return `isError: true` with a useful message — not crash.
- Call each tool with an extra unknown field. Should be ignored cleanly.
- Call each tool with a wrong type (string for a number). Should produce a typed validation error.

## What "done" looks like

- The actual root cause is in your hand (with file:line if available).
- The user knows which of the three buckets the bug lived in — this informs where they add a regression test.

## Common pitfalls

- Skipping step 1 because "the user says it's a schema issue". Trust the user's *symptom*, not their *diagnosis*. Read stderr first.
- Fixing the same bug in two places because the host UI cached an old `tools/list`. After fixes, restart the host before declaring victory.
