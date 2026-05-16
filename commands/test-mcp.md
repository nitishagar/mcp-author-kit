---
name: test-mcp
description: Run a one-screen smoke test of an MCP server using the bundled tools — inspect, grade every tool, generate a saved test plan.
---

# /test-mcp

When invoked, run the full inspect → grade → smoke sequence against an MCP server and print a single, scannable report. This is the Postman moment: one command, one screen, all the answers.

## Inputs

Ask the user for:

- `command` — the executable that boots the target MCP server (e.g. `node`, `python`, `uvx`).
- `args` — array of arguments to pass (e.g. `["./dist/index.js"]` or `["-m", "your_mcp_server"]`).
- `save_path` — ask the user for a save path for the smoke plan (or confirm they want stdout-only). Collect this **upfront**, before running the sequence, so the final report can name the destination without an extra round-trip.

Default `args` to `[]` if the user gives only a command. If the user declines a save path, leave it empty and report the not-saved branch below.

## Sequence

Run these tool calls in order. Stop and report at the first failure.

1. **`inspect_mcp_server({ command, args })`**
   - If `serverInfo` is null → report "Handshake failed; check stderr (run `tail_mcp_logs` next)" and stop.
   - If `tools` is empty → report "Server registered no tools." and stop.
   - Otherwise, capture `report.tools` and proceed.

2. **For each tool, `grade_tool_description({ name, description, input_schema })`**
   - Collect each `{ name, score, topIssue }`.

3. **`generate_smoke_tests({ command, args })`**
   - Capture the markdown plan.

## Output

Print this report verbatim to the user (substitute the bracketed values):

```
[server name] — MCP smoke test

✓ Handshake OK
✓ {N} tools / {N} resources (<resource_name>, ...) / {N} prompts (<prompt_name>, ...)

Rubric scores:
  • [tool_name] [score]/100  [— top issue if score < 85]
  • ...

[If save_path was provided → "Saved to <path>"]
[Otherwise → "Plan not saved (pass a path to persist)"]

Recommended next step:
  [If any tool scores < 85: "Run the designing-mcp-tool-descriptions skill on <lowest-scoring tool>."]
  [If all scores ≥ 85: "Paste the smoke plan into your repo as `tests/mcp-smoke-test-plan.md`."]
```

When substituting names in the resources/prompts line, list them from `report.resources[].name` and `report.prompts[].name`. If a list is empty, render `none` in place of the names. Never write files unless the user provided a `save_path` upfront.

## When not to use

- If the user has not yet scaffolded an MCP server, route them to `scaffolding-mcp-server-python` or `scaffolding-mcp-server-typescript` first.
- If the user is debugging an existing server failure, run the `debugging-mcp-server` skill instead — `/test-mcp` assumes the server boots cleanly.
