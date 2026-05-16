---
title: inspect_mcp_server
parent: Tools
nav_order: 1
permalink: /tools/inspect/
---

# `inspect_mcp_server`

Boot a target MCP server in a child process, complete the MCP handshake, and return its declared tools, resources, and prompts as structured JSON.

**Use when** the user is debugging or auditing an MCP server they own.
**Do not use** to call individual tools — use [`call_mcp_tool`](../call/) for that.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `command` | string | yes | Executable to run (e.g. `node`, `python`, `uvx`). |
| `args` | string[] | no | Arguments to pass to the command. |
| `env` | object | no | Extra environment variables to inject for the child process. |

## Example

```jsonc
{
  "command": "node",
  "args": ["./server/bundle/index.js"]
}
```

Returns a report shaped like:

```jsonc
{
  "serverInfo": { "name": "echo-fixture", "version": "0.0.1" },
  "tools": [{ "name": "echo", "description": "...", "inputSchema": { ... } }],
  "resources": [{ "uri": "echo://greeting", "name": "greeting" }],
  "prompts": [{ "name": "say-hello" }]
}
```

`serverInfo` is `null` when the handshake fails — fall back to [`tail_mcp_logs`](../tail/) to read the child's stderr.

## Source

[`server/src/tools/inspect.ts`](https://github.com/nitishagar/mcp-author-kit/blob/main/server/src/tools/inspect.ts) · [`server/src/lib/mcp-client.ts`](https://github.com/nitishagar/mcp-author-kit/blob/main/server/src/lib/mcp-client.ts)
