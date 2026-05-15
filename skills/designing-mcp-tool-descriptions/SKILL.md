---
name: designing-mcp-tool-descriptions
description: Iteratively grade and improve an MCP tool's name, description, and inputSchema using the bundled rubric.
trigger: Use when the user is authoring or editing an MCP tool definition, mentions "tool description", asks how to make their tool "more discoverable", or pastes a tool spec for review.
do_not_use: Do not use for prompt engineering of the agent's *system* prompt, for OpenAI function-calling specs, or for non-MCP tool definitions. Do not use to grade tool *implementations* — only the surface metadata.
---

# Designing MCP tool descriptions

This is the highest-leverage skill in the kit. Bad tool descriptions cause silent routing failures: the agent reaches for the wrong tool, or for none at all. The work is rubric-driven, not vibes-driven.

## Loop

For each tool the user wants to improve:

1. **Grade.** Call `grade_tool_description` with `{ name, description, input_schema }`. Note the score and the top issue by `points`.
2. **Show the user the top three issues only.** More than three is overwhelming. Skip `info` severity unless there's nothing else.
3. **Propose one targeted edit per issue.** Do not rewrite the whole description. Quote the original line and the proposed line so the user can accept or push back.
4. **Re-grade.** After the user applies the edits, re-run `grade_tool_description`. The score should rise; if it doesn't, your edits were wrong.
5. **Stop when score ≥ 85.** Going higher pays diminishing returns. Move to the next tool.

## What "done" looks like

- Every tool in the user's server scores ≥ 85.
- The top issues from the rubric are addressed, not just the cheap ones (e.g. fix `missing-negative-guidance` before fixing `name-not-snake-case`).
- The user can articulate, in one sentence, when their tool *should not* be invoked.

## Common pitfalls

- Padding descriptions to hit the length window. The rubric does not reward length; it penalises both extremes.
- Adding "use when" but no "do not use when" — `missing-negative-guidance` is the highest-impact rule for a reason.
- Burying inputs in prose instead of in the JSON Schema — agents read the schema, not the prose.
