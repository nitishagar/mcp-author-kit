import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..", "..");
const cmdPath = resolve(root, "commands", "test-mcp.md");

function splitFrontmatter(src: string): { frontmatter: string; body: string } {
  const match = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("missing YAML frontmatter");
  return { frontmatter: match[1]!, body: match[2]! };
}

describe("commands/test-mcp.md", () => {
  it("exists and parses YAML frontmatter with name and description", () => {
    expect(existsSync(cmdPath)).toBe(true);
    const src = readFileSync(cmdPath, "utf8");
    const { frontmatter } = splitFrontmatter(src);
    const nameLine = frontmatter.split("\n").find((l) => l.startsWith("name:"));
    const descLine = frontmatter
      .split("\n")
      .find((l) => l.startsWith("description:"));
    expect(nameLine).toBeDefined();
    expect(nameLine!.split(":")[1]!.trim()).toBe("test-mcp");
    expect(descLine).toBeDefined();
    expect(descLine!.split(":").slice(1).join(":").trim().length).toBeGreaterThan(
      0
    );
  });

  it("does not contain the literal placeholder 'Saved to <path-the-user-chose-or-stdout>'", () => {
    const src = readFileSync(cmdPath, "utf8");
    expect(src).not.toContain("Saved to <path-the-user-chose-or-stdout>");
  });

  it("contains both save-path branches: 'Saved to <path>' and a not-saved fallback", () => {
    const src = readFileSync(cmdPath, "utf8");
    expect(src).toContain("Saved to <path>");
    expect(src).toMatch(/Plan not saved \(pass a path to persist\)/);
  });

  it("instructs the agent to ask for the save path BEFORE the fenced report block", () => {
    const src = readFileSync(cmdPath, "utf8");
    const { body } = splitFrontmatter(src);
    const askIdx = body.search(/ask[^\n]*save path/i);
    const fenceIdx = body.indexOf("```\n[server name]");
    // Both must exist and ask must come first
    expect(askIdx).toBeGreaterThanOrEqual(0);
    expect(fenceIdx).toBeGreaterThan(askIdx);
  });

  it("renders resource and prompt names inline (not just counts) in the report template", () => {
    const src = readFileSync(cmdPath, "utf8");
    // The bare "{N} resources" / "{N} prompts" pattern (without names beside it) must be gone.
    expect(src).not.toMatch(/\{N\} resources \/ \{N\} prompts/);
    // It should reference the names — either via placeholder or explicit instruction.
    const hasPlaceholder =
      /resources?\s*\([^)]*<resource_name>/i.test(src) ||
      /report\.resources\[\]\.name/.test(src);
    expect(hasPlaceholder).toBe(true);
  });

  it("does not duplicate the standalone 'Smoke test plan:' label heading", () => {
    const src = readFileSync(cmdPath, "utf8");
    // The label "Smoke test plan:" (with the trailing colon, on its own line) must be gone.
    expect(src).not.toMatch(/^\s*Smoke test plan:\s*$/m);
  });
});
