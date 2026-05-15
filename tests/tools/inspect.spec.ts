import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { inspectTool, inspectToolHandler } from "../../server/src/tools/inspect.js";
import { inspect } from "../../server/src/lib/mcp-client.js";

const FIXTURE = resolve(__dirname, "..", "fixtures", "echo-server.mjs");

describe("inspect_mcp_server tool definition", () => {
  it("declares command as required", () => {
    expect(inspectTool.inputSchema.required).toContain("command");
  });

  it("uses snake_case naming and descriptive trigger", () => {
    expect(inspectTool.name).toBe("inspect_mcp_server");
    expect(inspectTool.description.toLowerCase()).toMatch(/use when/);
  });
});

describe("inspect() against the echo fixture", () => {
  it("connects and returns the fixture's tools, resources, and prompts", async () => {
    const report = await inspect({ command: "node", args: [FIXTURE] });
    expect(report.serverInfo?.name).toBe("echo-fixture");

    const toolNames = (report.tools as Array<{ name: string }>).map((t) => t.name);
    expect(toolNames).toContain("echo");

    const resourceUris = (report.resources as Array<{ uri: string }>).map((r) => r.uri);
    expect(resourceUris).toContain("echo://greeting");

    const promptNames = (report.prompts as Array<{ name: string }>).map((p) => p.name);
    expect(promptNames).toContain("say-hello");

    expect(report.warnings).toEqual([]);
  }, 15_000);
});

describe("inspectToolHandler", () => {
  it("returns isError when command is missing", async () => {
    const result = await inspectToolHandler({});
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { type: "text"; text: string }).text;
    expect(text).toMatch(/command/i);
  });

  it("happy path returns a JSON-encoded report against the echo fixture", async () => {
    const result = await inspectToolHandler({ command: "node", args: [FIXTURE] });
    expect(result.isError).toBeFalsy();
    const text = (result.content[0] as { type: "text"; text: string }).text;
    const parsed = JSON.parse(text);
    expect(parsed.serverInfo?.name).toBe("echo-fixture");
    expect(parsed.tools.length).toBeGreaterThan(0);
  }, 15_000);

  it("returns isError when the target command cannot be spawned", async () => {
    const result = await inspectToolHandler({
      command: "/does/not/exist/binary-xyz-nope",
      args: [],
    });
    expect(result.isError).toBe(true);
  }, 10_000);
});
