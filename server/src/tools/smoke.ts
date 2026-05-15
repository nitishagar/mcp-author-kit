import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { ToolDefinition } from "./grade.js";
import { generateSmokeTests } from "../lib/smoke.js";

export const smokeTool: ToolDefinition = {
  name: "generate_smoke_tests",
  description:
    "Inspect a target MCP server and produce a markdown smoke-test plan: per tool, " +
    "the rubric score, top rubric issue, two positive prompts that should invoke the tool, " +
    "and two negative prompts that should not. " +
    "Use when the user has just scaffolded an MCP server and wants a starting test plan in their repo. " +
    "Do not use to actually run the prompts — that's the agent's job; this only produces the plan.",
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
      env: {
        type: "object",
        description: "Extra environment variables for the spawned server.",
      },
    },
    required: ["command"],
  },
};

interface SmokeArgs {
  command?: unknown;
  args?: unknown;
  env?: unknown;
}

export async function smokeToolHandler(args: SmokeArgs): Promise<CallToolResult> {
  if (typeof args?.command !== "string" || args.command.length === 0) {
    return {
      isError: true,
      content: [{ type: "text", text: 'Missing or invalid "command".' }],
    };
  }

  try {
    const plan = await generateSmokeTests({
      command: args.command,
      args: Array.isArray(args.args) ? (args.args as string[]) : [],
      env: (args.env ?? undefined) as Record<string, string> | undefined,
    });
    return {
      content: [{ type: "text", text: plan.markdown }],
    };
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `generate_smoke_tests failed: ${(err as Error).message ?? String(err)}`,
        },
      ],
    };
  }
}
