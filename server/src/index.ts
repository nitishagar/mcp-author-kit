import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { gradeTool, gradeToolHandler } from "./tools/grade.js";
import type { ToolDefinition, ToolResult } from "./tools/grade.js";
import { inspectTool, inspectToolHandler } from "./tools/inspect.js";
import { tailTool, tailToolHandler } from "./tools/tail.js";
import { callTool, callToolHandler } from "./tools/call.js";

type Handler = (args: Record<string, unknown>) => Promise<ToolResult>;

export interface RegisteredTool {
  definition: ToolDefinition;
  handler: Handler;
}

export function getRegisteredTools(): RegisteredTool[] {
  return [
    { definition: gradeTool, handler: gradeToolHandler as Handler },
    { definition: inspectTool, handler: inspectToolHandler as Handler },
    { definition: tailTool, handler: tailToolHandler as Handler },
    { definition: callTool, handler: callToolHandler as Handler },
  ];
}

export function createServer(): Server {
  const server = new Server(
    { name: "mcp-author-kit", version: "0.2.0" },
    { capabilities: { tools: {} } }
  );

  const registry = new Map(
    getRegisteredTools().map((t) => [t.definition.name, t])
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Array.from(registry.values()).map((t) => t.definition),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const tool = registry.get(req.params.name);
    if (!tool) {
      return {
        isError: true,
        content: [{ type: "text", text: `Unknown tool: ${req.params.name}` }],
      };
    }
    return tool.handler((req.params.arguments ?? {}) as Record<string, unknown>);
  });

  return server;
}

export async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

const isEntrypoint = import.meta.url === `file://${process.argv[1]}`;
if (isEntrypoint) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
