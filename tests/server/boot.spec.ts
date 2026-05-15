import { describe, it, expect } from "vitest";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { createServer } from "../../server/src/index.js";

describe("server boot", () => {
  it("constructs an MCP Server instance", () => {
    const server = createServer();
    expect(server).toBeInstanceOf(Server);
  });

  it("declares tools capability", () => {
    const server = createServer();
    expect((server as unknown as { _capabilities: { tools?: unknown } })._capabilities.tools).toBeDefined();
  });
});
