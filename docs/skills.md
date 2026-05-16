---
title: Skills
nav_order: 3
permalink: /skills/
---

# Skills

Skills under `skills/` describe **when** to reach for each part of the kit. Cursor's agent loads them based on the `trigger` and `do_not_use` frontmatter — clear triggers route work to the right skill without the user having to name it.

## When to use which

| Skill | Trigger |
|---|---|
| [`scaffolding-mcp-server-python`](https://github.com/nitishagar/mcp-author-kit/blob/main/skills/scaffolding-mcp-server-python/SKILL.md) | User wants a new Python MCP server, or starts from a blank Python project that should expose MCP tools. |
| [`scaffolding-mcp-server-typescript`](https://github.com/nitishagar/mcp-author-kit/blob/main/skills/scaffolding-mcp-server-typescript/SKILL.md) | User wants a new TypeScript/JavaScript MCP server, or mentions Cloudflare Workers + MCP. |
| [`designing-mcp-tool-descriptions`](https://github.com/nitishagar/mcp-author-kit/blob/main/skills/designing-mcp-tool-descriptions/SKILL.md) | User is authoring or editing an MCP tool definition, mentions "tool description", or asks how to make their tool "more discoverable". |
| [`testing-mcp-server-locally`](https://github.com/nitishagar/mcp-author-kit/blob/main/skills/testing-mcp-server-locally/SKILL.md) | User wants to "test my MCP server", "smoke test it", or has just finished scaffolding and wants confidence before wiring into Cursor. |
| [`debugging-mcp-server`](https://github.com/nitishagar/mcp-author-kit/blob/main/skills/debugging-mcp-server/SKILL.md) | User reports an MCP server is "not showing up", "failing silently", "returning empty results", or behaving differently in Cursor vs. direct invocation. |

## Highest-leverage skill

`designing-mcp-tool-descriptions` is the single highest-leverage skill in the kit. Bad tool descriptions cause silent routing failures: the agent reaches for the wrong tool, or for none at all. The work is rubric-driven, not vibes-driven — see the [rubric reference](./rubric/) for the 10 rules and weights.

## Don't use these skills as fallbacks

Each skill's `do_not_use` frontmatter is intentional. For example, `debugging-mcp-server` is **not** the right first response when the user has not yet scaffolded a server — `scaffolding-mcp-server-*` is. Following the negative guidance keeps the agent from offering plausible-but-wrong help.
