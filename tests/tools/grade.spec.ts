import { describe, it, expect } from "vitest";
import { gradeTool, gradeToolHandler } from "../../server/src/tools/grade.js";

describe("grade_tool_description MCP tool", () => {
  it("declares a useful name, description, and inputSchema", () => {
    expect(gradeTool.name).toBe("grade_tool_description");
    expect(gradeTool.description).toMatch(/grade|score/i);
    expect(gradeTool.inputSchema.type).toBe("object");
    expect(gradeTool.inputSchema.required).toEqual(
      expect.arrayContaining(["name", "description", "input_schema"])
    );
  });

  it("returns a JSON-serialised score and issue list in the content", async () => {
    const result = await gradeToolHandler({
      name: "search_tickets",
      description:
        "Use this tool when the user wants to find support tickets. Do not use when modifying tickets.",
      input_schema: {
        type: "object",
        properties: { query: { type: "string", description: "Search query." } },
        required: ["query"],
      },
    });
    expect(result.isError).toBeFalsy();
    expect(result.content).toHaveLength(1);
    const text = (result.content[0] as { type: "text"; text: string }).text;
    const parsed = JSON.parse(text);
    expect(parsed.score).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(parsed.issues)).toBe(true);
  });

  it("returns isError=true when arguments are missing required fields", async () => {
    const result = await gradeToolHandler({} as never);
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { type: "text"; text: string }).text;
    expect(text).toMatch(/required|missing|name|description|input_schema/i);
  });
});
