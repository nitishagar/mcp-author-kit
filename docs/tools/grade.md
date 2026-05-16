---
title: grade_tool_description
parent: Tools
nav_order: 2
permalink: /tools/grade/
---

# `grade_tool_description`

Score an MCP tool definition against a deterministic [rubric](../../rubric/) and return a list of ranked issues.

**Use when** authoring or reviewing a tool's name, description, or `inputSchema`.
**Do not use** to grade prompts, agent system messages, or non-MCP function specs.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | The tool name (typically snake_case). |
| `description` | string | yes | The tool's description text as the agent would see it. |
| `input_schema` | object | yes | The tool's JSON Schema object describing its arguments. |
| `with_llm_clarity` | boolean | no | When `true`, runs an additional clarity heuristic pass. Defaults to `false`. |

### `with_llm_clarity` (since v0.2.1)

The optional `with_llm_clarity` flag enables three extra heuristic checks:

| Rule ID | Severity | What it flags |
|---|---|---|
| `clarity-vague-referent` | warn | Phrases like "it does", "the thing", "this thing" |
| `clarity-passive-voice` | warn | ≥2 passive constructions (`is searched`, `are returned`, ...) |
| `clarity-unexplained-acronyms` | info | Unintroduced 3+ letter acronyms (excluding common ones like `JSON`, `MCP`, `API`) |

The flag is named for forward-compatibility with a future MCP-sampling-backed implementation. Today the checks are purely deterministic, so the score is reproducible across clients.

## Example

```jsonc
{
  "name": "search_tickets",
  "description": "Use this tool when the user wants to find support tickets matching a query, status, or assignee. Do not use to modify tickets — use update_ticket.",
  "input_schema": {
    "type": "object",
    "properties": { "query": { "type": "string", "description": "Free-text query." } },
    "required": ["query"]
  },
  "with_llm_clarity": true
}
```

Returns:

```jsonc
{
  "score": 100,
  "issues": []
}
```

When score < 85, run the [`designing-mcp-tool-descriptions`](../../skills/) skill on the tool to iterate.

## Source

[`server/src/tools/grade.ts`](https://github.com/nitishagar/mcp-author-kit/blob/main/server/src/tools/grade.ts) · [`server/src/lib/rubric.ts`](https://github.com/nitishagar/mcp-author-kit/blob/main/server/src/lib/rubric.ts) · [`server/src/lib/clarity.ts`](https://github.com/nitishagar/mcp-author-kit/blob/main/server/src/lib/clarity.ts)
