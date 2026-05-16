#!/usr/bin/env node
// Wire skills + slash commands into Cursor's local skills directory so the
// agent UI surfaces them (`/test-mcp`, the five `mcp-author-kit` skills).
//
// Layout Cursor expects: ~/.cursor/skills-cursor/<name>/SKILL.md
// We expose:
//   - skills/<name>/                     -> symlink wholesale
//   - commands/test-mcp.md               -> ~/.cursor/skills-cursor/test-mcp/SKILL.md
//
// Idempotent: removes any existing symlink at the target before re-creating.
// Refuses to clobber a real (non-symlink) file/dir at the target.

import { existsSync, lstatSync, mkdirSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cursorSkills = resolve(homedir(), ".cursor/skills-cursor");

mkdirSync(cursorSkills, { recursive: true });

const link = (src, dest, kind) => {
  if (!existsSync(src)) {
    console.error(`  SKIP ${dest} — source missing: ${src}`);
    return;
  }
  if (existsSync(dest) || lstatSync(dest, { throwIfNoEntry: false })) {
    const stat = lstatSync(dest);
    if (!stat.isSymbolicLink()) {
      console.error(`  REFUSE ${dest} — exists and is not a symlink`);
      return;
    }
    rmSync(dest, { recursive: true, force: true });
  }
  symlinkSync(src, dest, kind);
  console.log(`  link ${dest} -> ${src}`);
};

console.log(`Installing mcp-author-kit dev components into ${cursorSkills}…`);

// Skills: each is its own directory containing SKILL.md
const skillsDir = resolve(repo, "skills");
for (const entry of readdirSync(skillsDir)) {
  const src = resolve(skillsDir, entry);
  const dest = resolve(cursorSkills, entry);
  link(src, dest, "dir");
}

// Slash command: Cursor expects <name>/SKILL.md; we put a directory with
// a symlinked SKILL.md so the source of truth stays in commands/test-mcp.md.
const cmdSrc = resolve(repo, "commands/test-mcp.md");
const cmdDestDir = resolve(cursorSkills, "test-mcp");
const cmdDestFile = resolve(cmdDestDir, "SKILL.md");
mkdirSync(cmdDestDir, { recursive: true });
link(cmdSrc, cmdDestFile, "file");

console.log("\nDone. Restart Cursor (Cmd-Q + reopen) to pick up the new entries.");
console.log("In a new agent chat, type / and look for `test-mcp` plus the five skill names.");
