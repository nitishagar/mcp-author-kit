# Agent instructions

## Inner loop

After every code change, run:

```bash
pnpm release-check
```

This runs `typecheck → test → bundle → smoke:boot`. Resolve any non-zero
exit before proceeding. The `smoke:boot` step spawns the bundled server
in `/tmp` (no `node_modules` available) and verifies it answers
`tools/list` with at least 5 tools — this catches the failure mode where
unit tests pass but the shipped bundle is broken.

## Local end-to-end check

```bash
pnpm verify:local
```

Bundles, then drives the server through all 5 tools against
`tests/fixtures/echo-server.mjs` and prints a one-screen pass/fail
report. Run this when you want to sanity-check that what's installed in
Cursor will actually work, without opening Cursor.

## Bundling

The marketplace install does not run `pnpm install` for users. The MCP
server is shipped as a single self-contained bundle at
`server/bundle/index.js`, produced by `pnpm bundle` (esbuild). That file
is committed to the repo. If you change anything under `server/src/`,
re-run `pnpm release-check` so the committed bundle stays in sync.
