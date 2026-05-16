---
title: tail_mcp_logs
parent: Tools
nav_order: 3
permalink: /tools/tail/
---

# `tail_mcp_logs`

Spawn a target MCP server and capture its stderr output for a fixed duration window.

**Use when** an MCP server appears to misbehave at startup or while serving a request — stdio servers usually surface diagnostics on stderr that the host UI swallows.
**Do not use** to inspect protocol traffic itself; use [`inspect_mcp_server`](../inspect/) for that.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `command` | string | yes | Executable to run. |
| `duration_seconds` | number | yes | How long to run the target before terminating it. Clamped to ≥ 0.1s. |
| `args` | string[] | no | Arguments to pass to the command. |
| `env` | object | no | Extra environment variables. |

## Example

```jsonc
{ "command": "node", "args": ["./broken-server.js"], "duration_seconds": 1 }
```

Returns:

```jsonc
{
  "stderr": "node:internal/...\nReferenceError: foo is not defined\n",
  "exitCode": 1,
  "killed": false,
  "durationMs": 87
}
```

Pair with [`inspect_mcp_server`](../inspect/) when you need both protocol-level state and process-level diagnostics — inspect first, fall back to tail if `serverInfo` is `null`.

## Source

[`server/src/tools/tail.ts`](https://github.com/nitishagar/mcp-author-kit/blob/main/server/src/tools/tail.ts) · [`server/src/lib/tail.ts`](https://github.com/nitishagar/mcp-author-kit/blob/main/server/src/lib/tail.ts)
