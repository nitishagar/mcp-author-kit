---
name: testing-mcp-server-locally
description: End-to-end smoke test of a local MCP server using inspect, grade, and call.
trigger: Use when the user wants to "test my MCP server", "smoke test it", "make sure it works", or has just finished scaffolding a server and wants confidence before wiring it into Cursor.
do_not_use: Do not use to write unit tests for the server's internal helpers — that is unrelated. Do not use for performance/load testing.
---

# Testing an MCP server locally

The five tools in this kit compose into a one-screen smoke test. Run them in this order; stop and report at the first red.

1. **`inspect_mcp_server`** — boot the server, list tools/resources/prompts. Expect: ≥ 1 tool, 0 warnings.
2. **For each tool, `grade_tool_description`** — confirm score ≥ 85. If not, switch to the `designing-mcp-tool-descriptions` skill before continuing.
3. **`call_mcp_tool`** — exercise each tool with a representative input. Expect: a non-empty content array, `isError` falsy.
4. **`generate_smoke_tests`** — produce a saved test plan the user can paste into their repo for repeatable runs.
5. **`tail_mcp_logs`** during steps 3–4 — collect any stderr the host UI would have hidden.

## What "done" looks like

- All tools are reachable, return content, and grade well.
- A persisted smoke-test plan exists in the repo.
- No surprising stderr output during the dry run.

## Common pitfalls

- Spawning the server with the wrong working directory — the user's import paths break silently. If `inspect_mcp_server` fails to connect, double-check the `command` and `args` first.
- Calling tools without inspecting first — the input schema may have changed under your nose.
