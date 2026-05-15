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
- Five agent skills under `skills/`: scaffolding (Python and TypeScript), designing tool descriptions, testing locally, debugging.
- Two starter templates under `templates/`: `python-stdio` and `typescript-cf-workers`.
