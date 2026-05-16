---
title: /test-mcp
nav_order: 5
permalink: /test-mcp/
---

# `/test-mcp`

`/test-mcp` is the one-screen smoke test: one slash command, one report, all the answers about whether a target MCP server is wired correctly.

## What it does

When you invoke `/test-mcp`, the agent runs three of the kit's tools in sequence against a target server you specify:

1. [`inspect_mcp_server`](./tools/inspect/) — handshake + list tools, resources, prompts.
2. [`grade_tool_description`](./tools/grade/) — rubric-grade every tool the server registered.
3. [`generate_smoke_tests`](./tools/smoke/) — produce a markdown smoke-test plan with positive + near-miss negative prompts per tool.

The agent then prints a single, scannable report. Stops and reports at the first failure (handshake fails, no tools registered, etc.).

## Inputs

The command asks you for:

- `command` — the executable that boots the target MCP server (e.g. `node`, `python`, `uvx`).
- `args` — array of arguments to pass.
- `save_path` — where to persist the smoke plan, or skip to keep stdout-only.

## Sample report

```
echo-fixture — MCP smoke test

✓ Handshake OK
✓ 1 tools / 1 resources (greeting) / 1 prompts (say-hello)

Rubric scores:
  • echo 100/100

Plan not saved (pass a path to persist)

Recommended next step:
  Paste the smoke plan into your repo as `tests/mcp-smoke-test-plan.md`.
```

The "Plan not saved (pass a path to persist)" branch fires when you skip `save_path`; otherwise it reads "Saved to `<path>`".

## When *not* to use

- The user has not yet scaffolded an MCP server → route to [`scaffolding-mcp-server-python`](./skills/) or [`scaffolding-mcp-server-typescript`](./skills/) first.
- The user is debugging an existing server failure → run [`debugging-mcp-server`](./skills/) instead. `/test-mcp` assumes the server boots cleanly.

## Source

[`commands/test-mcp.md`](https://github.com/nitishagar/mcp-author-kit/blob/main/commands/test-mcp.md)
