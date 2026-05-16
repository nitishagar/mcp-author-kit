---
title: mcp-author-kit
nav_order: 1
permalink: /
---

# mcp-author-kit

Scaffold, grade, test, and debug MCP servers from inside Cursor.

mcp-author-kit is a Cursor plugin that bundles an MCP utility server (5 tools), 5 agent skills, 2 starter server templates, and a `/test-mcp` slash command that drives the full inspect → grade → smoke-test flow in one shot.

## Install

In Cursor: open the Marketplace, search for **mcp-author-kit**, click Install.

To use locally before publishing, clone the repo and run:

```sh
pnpm install
pnpm release-check        # typecheck → test → bundle → smoke-boot
pnpm install:dev          # link plugin + register MCP server
```

## What's in the kit

### Tools (MCP server)

The kit ships an MCP server (`server/bundle/index.js`) that registers five tools. Each tool has a dedicated reference page:

- [`inspect_mcp_server`](./tools/inspect/) — boot a target server and list its tools, resources, prompts.
- [`grade_tool_description`](./tools/grade/) — score an MCP tool definition against a 10-rule rubric.
- [`tail_mcp_logs`](./tools/tail/) — capture a target server's stderr for a fixed window.
- [`call_mcp_tool`](./tools/call/) — invoke a single tool on a target server with arguments.
- [`generate_smoke_tests`](./tools/smoke/) — compose the above into a markdown smoke-test plan.

### Skills

Five agent skills under `skills/` describe **when** to reach for each part of the kit. See the [skills walkthrough](./skills/) for selection guidance.

### Templates

Two ready-to-clone server templates under `templates/`:

- `python-stdio` — minimal Python MCP server over stdio.
- `typescript-cf-workers` — TypeScript MCP server, Cloudflare Workers-friendly with stdio for local dev.

### Slash command

[`/test-mcp`](./test-mcp/) — one-line command that runs `inspect → grade → generate_smoke_tests` and prints a one-screen report.

### Rubric

The deterministic 10-rule rubric used by `grade_tool_description` is documented in [rubric.md](./rubric/), including weights and pass/fail examples.

## Source & issues

Code and issues live on GitHub: [nitishagar/mcp-author-kit](https://github.com/nitishagar/mcp-author-kit).
