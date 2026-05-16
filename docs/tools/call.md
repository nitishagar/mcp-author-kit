---
title: call_mcp_tool
parent: Tools
nav_order: 4
---

# `call_mcp_tool`

Invoke a single tool on a target MCP server and return its response plus timing.

**Use when** the user wants to exercise an MCP tool end-to-end (e.g. "run my `search_tickets` tool with `query=billing`").
**Do not use** to enumerate available tools — call [`inspect_mcp_server`](../inspect/) for that.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `command` | string | yes | Executable to spawn the target MCP server. |
| `tool_name` | string | yes | Name of the tool to call. |
| `args` | string[] | no | Arguments to pass to the command. |
| `arguments` | object | no | Arguments object forwarded to the target tool. |
| `env` | object | no | Extra environment variables. |

## Example

```jsonc
{
  "command": "node",
  "args": ["tests/fixtures/echo-server.mjs"],
  "tool_name": "echo",
  "arguments": { "msg": "hi" }
}
```

Returns:

```jsonc
{
  "result": { "content": [{ "type": "text", "text": "hi" }] },
  "durationMs": 42
}
```

## Source

[`server/src/tools/call.ts`](https://github.com/nitishagar/mcp-author-kit/blob/main/server/src/tools/call.ts) · [`server/src/lib/mcp-client.ts`](https://github.com/nitishagar/mcp-author-kit/blob/main/server/src/lib/mcp-client.ts)
