import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { callRemoteTool } from "../../server/src/lib/mcp-client.js";
import { callTool, callToolHandler } from "../../server/src/tools/call.js";

const FIXTURE = resolve(__dirname, "..", "fixtures", "echo-server.mjs");

describe("callRemoteTool against the echo fixture", () => {
  it("invokes echo and returns the message back verbatim with timing data", async () => {
    const result = await callRemoteTool({
      command: "node",
      args: [FIXTURE],
      toolName: "echo",
      arguments: { msg: "hello world" },
    });
    expect(result.isError).toBeFalsy();
    const content = result.response.content as Array<{ type: "text"; text: string }>;
    expect(content[0]?.text).toBe("hello world");
    expect(result.elapsedMs).toBeGreaterThan(0);
  }, 15_000);

  it("surfaces unknown-tool errors from the target server", async () => {
    const result = await callRemoteTool({
      command: "node",
      args: [FIXTURE],
      toolName: "nonexistent_tool",
      arguments: {},
    });
    expect(result.isError).toBeTruthy();
  }, 15_000);
});

describe("call_mcp_tool MCP tool", () => {
  it("declares snake_case name and the four required args", () => {
    expect(callTool.name).toBe("call_mcp_tool");
    expect(callTool.inputSchema.required).toEqual(
      expect.arrayContaining(["command", "tool_name"])
    );
    expect(callTool.description.toLowerCase()).toMatch(/use when/);
    expect(callTool.description.toLowerCase()).toMatch(/do not use/);
  });

  it("returns isError when command or tool_name is missing", async () => {
    const noCommand = await callToolHandler({ tool_name: "echo" });
    expect(noCommand.isError).toBe(true);
    const noTool = await callToolHandler({ command: "node" });
    expect(noTool.isError).toBe(true);
  });

  it("happy path returns JSON-encoded response plus elapsed time", async () => {
    const result = await callToolHandler({
      command: "node",
      args: [FIXTURE],
      tool_name: "echo",
      arguments: { msg: "ping" },
    });
    expect(result.isError).toBeFalsy();
    const text = (result.content[0] as { type: "text"; text: string }).text;
    const parsed = JSON.parse(text);
    expect(parsed.elapsedMs).toBeGreaterThan(0);
    expect(parsed.response.content[0].text).toBe("ping");
  }, 15_000);
});
