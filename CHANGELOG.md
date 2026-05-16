# Changelog

All notable changes to mcp-author-kit are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Deferred to v0.3
- LLM-backed clarity pass via MCP sampling. The `with_llm_clarity` flag landed in v0.2.1 with a deterministic heuristic implementation; the sampling-backed version is tracked separately.

## [0.2.1] — 2026-05-16

### Added
- GitHub Pages docs site under `/docs` (Jekyll, theme `jekyll-theme-minimal`). Live at https://nitishagar.github.io/mcp-author-kit/. Includes a landing page, a tool reference page per MCP tool, a skills walkthrough, the rubric reference (rules + weights + pass/fail examples), and a `/test-mcp` tutorial.
- `with_llm_clarity` flag on `grade_tool_description`. When set to `true`, runs three additional heuristic checks: `clarity-vague-referent`, `clarity-passive-voice`, `clarity-unexplained-acronyms`. Default is `false`. The flag is named for forward-compatibility with a future MCP-sampling-backed implementation; today it is purely deterministic.
- README docs badge linking to the Pages site.

### Changed
- `.cursor-plugin/plugin.json` `homepage` now points at the docs site (was the GitHub repo URL). `repository` still points at GitHub.

## [0.2.0] — 2026-05-16

### Added
- Marketplace packaging: bundled MCP server (`server/bundle/index.js`, esbuild, ~197 KB) committed in-tree so installs need no `pnpm install` or build step.
- `pnpm release-check` script (`typecheck → test → bundle → smoke-boot`) and `scripts/smoke-boot.mjs` JSON-RPC harness used by CI.
- `assets/logo.png` (1:1, 512×512, white background plate) and `logo` / `repository` fields in `.cursor-plugin/plugin.json`.
- Phase 0 foundation: pnpm + TypeScript + Vitest scaffold, MCP server skeleton, plugin manifest, CI.
- `grade_tool_description` MCP tool with deterministic 10-rule rubric (`server/src/lib/rubric.ts`).
- `inspect_mcp_server` MCP tool that connects to a target server and aggregates tools, resources, and prompts. Includes a reusable MCP client wrapper and an echo fixture used by tests.
- `tail_mcp_logs` MCP tool that captures stderr from a target server for a fixed duration window.
- `call_mcp_tool` MCP tool that invokes a single tool on a target server and returns the response with timing data.
- `generate_smoke_tests` MCP tool that composes inspect + rubric into a markdown smoke-test plan.
- `/test-mcp` slash command (`commands/test-mcp.md`) that drives the full inspect → grade → smoke flow. Negative prompts are tool-aware near-miss + generic baseline (e.g. `echo→log`, `create→delete`, `get/read/list→update`, `delete→restore`); resource and prompt names render inline in the report; save-path is collected upfront in **Inputs** and reported as `Saved to <path>` or `Plan not saved (pass a path to persist)`.
- Five agent skills under `skills/`: scaffolding (Python and TypeScript), designing tool descriptions, testing locally, debugging.
- Two starter templates under `templates/`: `python-stdio` and `typescript-cf-workers`.

