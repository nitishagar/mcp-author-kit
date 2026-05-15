import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { ToolDefinition } from "./grade.js";
import { callRemoteTool } from "../lib/mcp-client.js";

export const callTool: ToolDefinition = {
  name: "call_mcp_tool",
  description:
    "Invoke a single tool on a target MCP server and return its response plus timing. " +
    "Use when the user wants to exercise an MCP tool end-to-end (e.g. \"run my search_tickets tool with query=billing\"). " +
    "Do not use to enumerate available tools — call inspect_mcp_server for that.",
  inputSchema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "Executable to spawn the target MCP server.",
      },
      args: {
        type: "array",
        description: "Arguments to pass to the command.",
        items: { type: "string" },
      },
      tool_name: {
        type: "string",
        description: "Name of the tool to call on the target server.",
      },
      arguments: {
        type: "object",
        description: "Arguments object to forward to the target tool.",
      },
      env: {
        type: "object",
        description: "Extra environment variables for the spawned server.",
      },
    },
    required: ["command", "tool_name"],
  },
};

interface CallArgs {
  command?: unknown;
  args?: unknown;
  tool_name?: unknown;
  arguments?: unknown;
  env?: unknown;
}

export async function callToolHandler(args: CallArgs): Promise<CallToolResult> {
  if (typeof args?.command !== "string" || args.command.length === 0) {
    return {
      isError: true,
      content: [{ type: "text", text: 'Missing or invalid "command".' }],
    };
  }
  if (typeof args?.tool_name !== "string" || args.tool_name.length === 0) {
    return {
      isError: true,
      content: [{ type: "text", text: 'Missing or invalid "tool_name".' }],
    };
  }

  try {
    const result = await callRemoteTool({
      command: args.command,
      args: Array.isArray(args.args) ? (args.args as string[]) : [],
      env: (args.env ?? undefined) as Record<string, string> | undefined,
      toolName: args.tool_name,
      arguments: (args.arguments ?? {}) as Record<string, unknown>,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `call_mcp_tool failed: ${(err as Error).message ?? String(err)}`,
        },
      ],
    };
  }
}
