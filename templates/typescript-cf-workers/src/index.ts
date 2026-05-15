import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// stdout is reserved for MCP framing — use console.error for human-readable output.
console.error("your-mcp-server starting on stdio");

const server = new Server(
  { name: "your-mcp-server", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "echo",
      description:
        "Use when the user wants to echo a message back verbatim. " +
        "Do not use to transform, summarise, or otherwise modify the message — this tool is intentionally a passthrough.",
      inputSchema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Message to echo back unchanged.",
          },
        },
        required: ["message"],
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
  const message = (req.params.arguments as { message?: unknown })?.message ?? "";
  return { content: [{ type: "text", text: String(message) }] };
});

await server.connect(new StdioServerTransport());
