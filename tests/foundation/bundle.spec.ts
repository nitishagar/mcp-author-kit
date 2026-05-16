import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..", "..");
const bundlePath = resolve(root, "server/bundle/index.js");

describe("server bundle", () => {
  it("exists at server/bundle/index.js", () => {
    expect(existsSync(bundlePath)).toBe(true);
  });

  it("is non-empty", () => {
    expect(statSync(bundlePath).size).toBeGreaterThan(1024);
  });

  it("identifies itself as mcp-author-kit (SDK inlined)", () => {
    const contents = readFileSync(bundlePath, "utf8");
    expect(contents).toContain('name: "mcp-author-kit"');
    expect(contents).toContain("ListToolsRequestSchema");
  });
});
