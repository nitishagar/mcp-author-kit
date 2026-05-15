# Changelog

All notable changes to mcp-author-kit are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Phase 0 foundation: pnpm + TypeScript + Vitest scaffold, MCP server skeleton, plugin manifest, CI.
- `grade_tool_description` MCP tool with deterministic 10-rule rubric (`server/src/lib/rubric.ts`).
- `inspect_mcp_server` MCP tool that connects to a target server and aggregates tools, resources, and prompts. Includes a reusable MCP client wrapper and an echo fixture used by tests.
- `tail_mcp_logs` MCP tool that captures stderr from a target server for a fixed duration window.
- `call_mcp_tool` MCP tool that invokes a single tool on a target server and returns the response with timing data.
- `generate_smoke_tests` MCP tool that composes inspect + rubric into a markdown smoke-test plan.
- `/test-mcp` slash command (`commands/test-mcp.md`) that drives the full inspect → grade → smoke flow.
- Five agent skills under `skills/`: scaffolding (Python and TypeScript), designing tool descriptions, testing locally, debugging.
- Two starter templates under `templates/`: `python-stdio` and `typescript-cf-workers`.

### Deferred
- LLM clarity pass extension to `grade_tool_description` (planned for v0.2.1, behind `--with-llm-clarity`).
