---
title: Rubric reference
nav_order: 4
permalink: /rubric/
---

# Rubric reference

`grade_tool_description` runs every tool definition through a deterministic 10-rule rubric. Each rule has a fixed point deduction; the score is `max(0, 100 − Σ deductions)`.

The rubric is intentionally small and opinionated: every rule corresponds to a known routing-failure mode an agent has hit in the wild.

## The 10 rules

| Rule ID | Severity | Points | What it checks |
|---|---|---|---|
| `description-missing` | error | 30 | Tool has no description. Agents will not know when to use it. |
| `description-too-short` | warn | 12 | < 40 chars. Not enough signal to route reliably. |
| `description-too-long` | warn | 8 | > 300 chars. Many hosts truncate around 200. |
| `missing-trigger-language` | warn | 10 | No "Use when…" or "When the user…" clause. |
| `missing-negative-guidance` | warn | 12 | No "Do not use when…". One of the highest-leverage edits. |
| `schema-no-properties` | warn | 10 | `input_schema.properties` is empty. |
| `schema-property-missing-description` | warn | 6 (per property) | A property has no `description`. |
| `schema-property-missing-type` | error | 8 (per property) | A property has no `type`. Strict clients will reject. |
| `name-not-snake-case` | warn | 5 | Tool name is not `snake_case`. |
| `name-vague-verb` | warn | 6 | Name starts with a vague verb (`do`, `process`, `handle`, `manage`, `run`, `execute`, `perform`, `operate`, `stuff`). |

## Optional clarity pass (since v0.2.1)

When `with_llm_clarity: true` is passed, three additional heuristic checks run:

| Rule ID | Severity | Points | What it checks |
|---|---|---|---|
| `clarity-vague-referent` | warn | 8 | Phrases like "it does", "the thing", "this thing" |
| `clarity-passive-voice` | warn | 6 | ≥ 2 passive constructions |
| `clarity-unexplained-acronyms` | info | 3 | Unintroduced 3+ letter acronyms (excluding common ones) |

The flag is named `with_llm_clarity` for forward-compatibility — a future version may move these checks to MCP sampling. Today the implementation is purely deterministic and stays in-process.

## Pass / fail examples

### Score 100 (well-formed)

```json
{
  "name": "search_tickets",
  "description": "Use this tool when the user wants to find support tickets matching a query, status, or assignee. Returns up to 50 tickets ordered by recency. Do not use when the user wants to modify a ticket — use update_ticket for that.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Free-text search query." }
    },
    "required": ["query"]
  }
}
```

### Score < 60 (typical anti-patterns)

```json
{
  "name": "DoStuff",
  "description": "Does the thing.",
  "input_schema": {
    "type": "object",
    "properties": { "x": {} }
  }
}
```

This trips: `description-too-short`, `missing-trigger-language`, `missing-negative-guidance`, `schema-property-missing-description`, `schema-property-missing-type`, `name-not-snake-case`, `name-vague-verb` — and, with the clarity pass on, `clarity-vague-referent` for "the thing".

## Source

[`server/src/lib/rubric.ts`](https://github.com/nitishagar/mcp-author-kit/blob/main/server/src/lib/rubric.ts) · [`server/src/lib/clarity.ts`](https://github.com/nitishagar/mcp-author-kit/blob/main/server/src/lib/clarity.ts)
