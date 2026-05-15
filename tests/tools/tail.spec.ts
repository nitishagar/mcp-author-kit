import { describe, it, expect } from "vitest";
import { tailMcpLogs } from "../../server/src/lib/tail.js";
import { tailTool, tailToolHandler } from "../../server/src/tools/tail.js";

describe("tailMcpLogs library", () => {
  it("captures stderr emitted by the target process within the duration window", async () => {
    const result = await tailMcpLogs({
      command: "node",
      args: ["-e", "process.stderr.write('hello\\n'); process.stderr.write('world\\n');"],
      durationSeconds: 0.4,
    });
    expect(result.stderr).toContain("hello");
    expect(result.stderr).toContain("world");
    expect(result.durationMs).toBeGreaterThan(0);
  }, 5_000);

  it("kills long-running processes at the duration boundary", async () => {
    const start = Date.now();
    const result = await tailMcpLogs({
      command: "node",
      args: [
        "-e",
        "setInterval(() => process.stderr.write('tick\\n'), 30); setTimeout(()=>{}, 60_000);",
      ],
      durationSeconds: 0.3,
    });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(2_000);
    expect(result.stderr.split("tick").length).toBeGreaterThan(1);
    expect(result.timedOut).toBe(true);
  }, 5_000);

  it("clamps non-positive durations to a small positive minimum", async () => {
    const result = await tailMcpLogs({
      command: "node",
      args: ["-e", "process.stderr.write('x');"],
      durationSeconds: 0,
    });
    expect(typeof result.stderr).toBe("string");
  }, 5_000);
});

describe("tail_mcp_logs MCP tool", () => {
  it("declares a snake_case name and uses 'use when' / 'do not use' guidance", () => {
    expect(tailTool.name).toBe("tail_mcp_logs");
    expect(tailTool.description.toLowerCase()).toMatch(/use when/);
    expect(tailTool.description.toLowerCase()).toMatch(/do not use/);
  });

  it("requires command and duration_seconds", () => {
    expect(tailTool.inputSchema.required).toEqual(
      expect.arrayContaining(["command", "duration_seconds"])
    );
  });

  it("returns isError when arguments are missing", async () => {
    const result = await tailToolHandler({});
    expect(result.isError).toBe(true);
  });

  it("happy path returns JSON-encoded stderr capture", async () => {
    const result = await tailToolHandler({
      command: "node",
      args: ["-e", "process.stderr.write('boot ok\\n');"],
      duration_seconds: 0.4,
    });
    expect(result.isError).toBeFalsy();
    const text = (result.content[0] as { type: "text"; text: string }).text;
    const parsed = JSON.parse(text);
    expect(parsed.stderr).toContain("boot ok");
  }, 5_000);
});
