#!/usr/bin/env node
// Remove dev symlinks installed by scripts/install-dev.mjs from
// ~/.cursor/skills-cursor/. Only removes symlinks pointing back into this
// repo — leaves anything else alone.

import { lstatSync, readdirSync, readlinkSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cursorSkills = resolve(homedir(), ".cursor/skills-cursor");

const pointsIntoRepo = (p) => {
  try {
    const target = readlinkSync(p);
    const abs = resolve(dirname(p), target);
    return abs.startsWith(repo + "/") || abs === repo;
  } catch {
    return false;
  }
};

let removed = 0;
for (const entry of readdirSync(cursorSkills)) {
  const dest = resolve(cursorSkills, entry);
  let stat;
  try { stat = lstatSync(dest); } catch { continue; }

  if (stat.isSymbolicLink() && pointsIntoRepo(dest)) {
    rmSync(dest, { force: true });
    console.log(`  unlink ${dest}`);
    removed++;
    continue;
  }

  if (stat.isDirectory()) {
    // /test-mcp dir we created with a symlinked SKILL.md inside.
    const inner = resolve(dest, "SKILL.md");
    try {
      const innerStat = lstatSync(inner);
      if (innerStat.isSymbolicLink() && pointsIntoRepo(inner)) {
        rmSync(dest, { recursive: true, force: true });
        console.log(`  unlink ${dest}/`);
        removed++;
      }
    } catch { /* no SKILL.md, leave alone */ }
  }
}

console.log(`\nRemoved ${removed} dev component${removed === 1 ? "" : "s"}.`);
