import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { ToolDefinition } from "./grade.js";
import { inspect, type InspectionTarget } from "../lib/mcp-client.js";

export const inspectTool: ToolDefinition = {
  name: "inspect_mcp_server",
  description:
    "Boot a target MCP server in a child process, complete the MCP handshake, " +
    "and return its declared tools, resources, and prompts as structured JSON. " +
    "Use when the user is debugging or auditing an MCP server they own. " +
    "Do not use to call individual tools — use call_mcp_tool for that.",
  inputSchema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: 'Executable to run (e.g. "node", "python", "uvx").',
      },
      args: {
        type: "array",
        description: "Arguments to pass to the command.",
        items: { type: "string" },
      },
      env: {
        type: "object",
        description: "Extra environment variables to inject for the child process.",
      },
    },
    required: ["command"],
  },
};

export async function inspectToolHandler(
  args: Partial<InspectionTarget>
): Promise<CallToolResult> {
  if (!args || typeof args.command !== "string" || args.command.length === 0) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: 'Missing required argument "command". Pass the executable that boots the target MCP server.',
        },
      ],
    };
  }

  try {
    const report = await inspect({
      command: args.command,
      args: args.args ?? [],
      env: args.env,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
    };
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `inspect_mcp_server failed to connect to "${args.command}": ${(err as Error).message ?? String(err)}`,
        },
      ],
    };
  }
}
