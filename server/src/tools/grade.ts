import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { gradeToolDescription, type ToolDescriptor } from "../lib/rubric.js";

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export type ToolResult = CallToolResult;

export const gradeTool: ToolDefinition = {
  name: "grade_tool_description",
  description:
    "Score an MCP tool definition against a deterministic rubric and return a list of ranked issues. " +
    "Use when authoring or reviewing a tool's name, description, or inputSchema. " +
    "Do not use to grade prompts, agent system messages, or non-MCP function specs.",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string", description: "The tool name (typically snake_case)." },
      description: { type: "string", description: "The tool's description text as the agent would see it." },
      input_schema: {
        type: "object",
        description: "The tool's JSON Schema object describing its arguments.",
      },
    },
    required: ["name", "description", "input_schema"],
  },
};

export async function gradeToolHandler(
  args: Partial<ToolDescriptor>
): Promise<ToolResult> {
  const missing: string[] = [];
  if (typeof args?.name !== "string") missing.push("name");
  if (typeof args?.description !== "string") missing.push("description");
  if (!args?.input_schema || typeof args.input_schema !== "object") missing.push("input_schema");

  if (missing.length > 0) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Missing required argument(s): ${missing.join(", ")}. ` +
            `grade_tool_description requires { name, description, input_schema }.`,
        },
      ],
    };
  }

  const result = gradeToolDescription(args as ToolDescriptor);
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}
