import { describe, it, expect } from "vitest";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { createServer, getRegisteredTools } from "../../server/src/index.js";

describe("server boot", () => {
  it("constructs an MCP Server instance", () => {
    expect(createServer()).toBeInstanceOf(Server);
  });

  it("declares tools capability", () => {
    const server = createServer();
    expect((server as unknown as { _capabilities: { tools?: unknown } })._capabilities.tools).toBeDefined();
  });

  it("registers grade_tool_description in the tool registry", () => {
    const names = getRegisteredTools().map((t) => t.definition.name);
    expect(names).toContain("grade_tool_description");
  });

  it("registers inspect_mcp_server in the tool registry", () => {
    const names = getRegisteredTools().map((t) => t.definition.name);
    expect(names).toContain("inspect_mcp_server");
  });

  it("registers tail_mcp_logs in the tool registry", () => {
    const names = getRegisteredTools().map((t) => t.definition.name);
    expect(names).toContain("tail_mcp_logs");
  });
});
