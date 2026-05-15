import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { generateSmokeTests } from "../../server/src/lib/smoke.js";
import { smokeTool, smokeToolHandler } from "../../server/src/tools/smoke.js";

const FIXTURE = resolve(__dirname, "..", "fixtures", "echo-server.mjs");

describe("generateSmokeTests against the echo fixture", () => {
  it("produces a markdown plan that mentions every tool the server exposes", async () => {
    const plan = await generateSmokeTests({ command: "node", args: [FIXTURE] });
    expect(plan.markdown).toMatch(/# Smoke test plan/);
    expect(plan.markdown).toContain("echo");
    expect(plan.tools.length).toBeGreaterThanOrEqual(1);
  }, 15_000);

  it("includes a happy-path prompt and a negative-prompt section per tool", async () => {
    const plan = await generateSmokeTests({ command: "node", args: [FIXTURE] });
    expect(plan.markdown).toMatch(/should invoke/i);
    expect(plan.markdown).toMatch(/should not invoke/i);
  }, 15_000);

  it("annotates each tool with its rubric score", async () => {
    const plan = await generateSmokeTests({ command: "node", args: [FIXTURE] });
    const echo = plan.tools.find((t) => t.name === "echo");
    expect(echo).toBeDefined();
    expect(typeof echo!.score).toBe("number");
    expect(echo!.score).toBeGreaterThan(0);
  }, 15_000);
});

describe("generate_smoke_tests MCP tool", () => {
  it("declares snake_case name and the right shape", () => {
    expect(smokeTool.name).toBe("generate_smoke_tests");
    expect(smokeTool.inputSchema.required).toContain("command");
    expect(smokeTool.description.toLowerCase()).toMatch(/use when/);
    expect(smokeTool.description.toLowerCase()).toMatch(/do not use/);
  });

  it("returns isError when command is missing", async () => {
    const result = await smokeToolHandler({});
    expect(result.isError).toBe(true);
  });

  it("happy path returns a markdown plan as text content", async () => {
    const result = await smokeToolHandler({ command: "node", args: [FIXTURE] });
    expect(result.isError).toBeFalsy();
    const text = (result.content[0] as { type: "text"; text: string }).text;
    expect(text).toContain("Smoke test plan");
    expect(text).toContain("echo");
  }, 15_000);
});
