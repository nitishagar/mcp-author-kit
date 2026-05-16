---
title: generate_smoke_tests
parent: Tools
nav_order: 5
---

# `generate_smoke_tests`

Inspect a target MCP server and produce a markdown smoke-test plan: per tool, the rubric score, top rubric issue, two positive prompts that should invoke the tool, and two negative prompts that should not.

**Use when** the user has just scaffolded an MCP server and wants a starting test plan in their repo.
**Do not use** to actually run the prompts — that's the agent's job. This tool only produces the plan.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `command` | string | yes | Executable to spawn the target server. |
| `args` | string[] | no | Arguments to pass to the command. |
| `env` | object | no | Extra environment variables. |

## How negative prompts are derived

Each tool gets two negative prompts: one **near-miss** derived from the tool's verb (e.g. `echo→log`, `create→delete`, `get/read/list→update`, `delete→restore`, `start↔stop`, `open↔close`) plus one generic baseline. The near-miss catches routing failures where the agent reaches for a similar-sounding wrong tool; the generic baseline catches "tool fires on totally unrelated requests" failures.

See [`server/src/lib/smoke.ts`](https://github.com/nitishagar/mcp-author-kit/blob/main/server/src/lib/smoke.ts) for the full lookup.

## Example output

```md
# Smoke test plan for echo-fixture

## Tool: `echo` (rubric score: 100/100)

**Prompts that should invoke this tool:**
  1. `Echo the input: "<sample input>".`
  2. `Please echo the input for this case.`

**Prompts that should NOT invoke this tool:**
  1. `Log this message to the console.`
  2. `Help me write a grocery list.`
```

## Source

[`server/src/tools/smoke.ts`](https://github.com/nitishagar/mcp-author-kit/blob/main/server/src/tools/smoke.ts) · [`server/src/lib/smoke.ts`](https://github.com/nitishagar/mcp-author-kit/blob/main/server/src/lib/smoke.ts)
