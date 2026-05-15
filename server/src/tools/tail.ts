import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { ToolDefinition } from "./grade.js";
import { tailMcpLogs } from "../lib/tail.js";

export const tailTool: ToolDefinition = {
  name: "tail_mcp_logs",
  description:
    "Spawn a target MCP server and capture its stderr output for a fixed duration window. " +
    "Use when an MCP server appears to misbehave at startup or while serving a request — " +
    "stdio servers usually surface diagnostics on stderr that the host UI swallows. " +
    "Do not use to inspect the protocol traffic itself; use inspect_mcp_server for that.",
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
      duration_seconds: {
        type: "number",
        description: "How long to run the target before terminating it. Clamped to >= 0.1s.",
      },
      env: {
        type: "object",
        description: "Extra environment variables to inject for the child process.",
      },
    },
    required: ["command", "duration_seconds"],
  },
};

interface TailArgs {
  command?: unknown;
  args?: unknown;
  duration_seconds?: unknown;
  env?: unknown;
}

export async function tailToolHandler(args: TailArgs): Promise<CallToolResult> {
  if (typeof args?.command !== "string" || args.command.length === 0) {
    return {
      isError: true,
      content: [
        { type: "text", text: 'Missing or invalid "command". Pass the executable to spawn.' },
      ],
    };
  }
  if (typeof args?.duration_seconds !== "number" || Number.isNaN(args.duration_seconds)) {
    return {
      isError: true,
      content: [
        { type: "text", text: 'Missing or invalid "duration_seconds". Pass a positive number.' },
      ],
    };
  }

  try {
    const result = await tailMcpLogs({
      command: args.command,
      args: Array.isArray(args.args) ? (args.args as string[]) : [],
      env: (args.env ?? undefined) as NodeJS.ProcessEnv | undefined,
      durationSeconds: args.duration_seconds,
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
          text: `tail_mcp_logs failed: ${(err as Error).message ?? String(err)}`,
        },
      ],
    };
  }
}
