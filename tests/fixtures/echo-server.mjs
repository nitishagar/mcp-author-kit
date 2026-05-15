#!/usr/bin/env node
// Minimal MCP fixture server used by the inspect_mcp_server integration test.
// Declares tools capability with one tool ("echo"), and resources/prompts so
// the inspect tool exercises every list endpoint.
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  { name: "echo-fixture", version: "0.0.1" },
  { capabilities: { tools: {}, resources: {}, prompts: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "echo",
      description: "Use when the user wants to echo a string back. Do not use to transform the message.",
      inputSchema: {
        type: "object",
        properties: { msg: { type: "string", description: "Message to echo back verbatim." } },
        required: ["msg"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name !== "echo") {
    return {
      isError: true,
      content: [{ type: "text", text: `Unknown tool: ${req.params.name}` }],
    };
  }
  return {
    content: [{ type: "text", text: String(req.params.arguments?.msg ?? "") }],
  };
});

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "echo://greeting",
      name: "greeting",
      description: "A static greeting for fixture purposes.",
      mimeType: "text/plain",
    },
  ],
}));

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [
    {
      name: "say-hello",
      description: "Prompt that says hello.",
    },
  ],
}));

await server.connect(new StdioServerTransport());
