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

  it("declares an optional `with_llm_clarity` boolean in inputSchema (not required)", () => {
    const props = gradeTool.inputSchema.properties as Record<
      string,
      { type?: string }
    >;
    expect(props.with_llm_clarity).toBeDefined();
    expect(props.with_llm_clarity!.type).toBe("boolean");
    expect(gradeTool.inputSchema.required).not.toContain("with_llm_clarity");
  });

  it("runs the clarity pass when with_llm_clarity=true and emits clarity-* issues for a vague description", async () => {
    const result = await gradeToolHandler({
      name: "search_tickets",
      description:
        "Use this when the user asks. It does the thing and returns it. Do not use otherwise.",
      input_schema: {
        type: "object",
        properties: { query: { type: "string", description: "Search query." } },
        required: ["query"],
      },
      with_llm_clarity: true,
    } as never);
    expect(result.isError).toBeFalsy();
    const text = (result.content[0] as { type: "text"; text: string }).text;
    const parsed = JSON.parse(text);
    const ids: string[] = parsed.issues.map(
      (i: { ruleId: string }) => i.ruleId
    );
    expect(ids.some((id) => id.startsWith("clarity-"))).toBe(true);
  });

  it("does not run the clarity pass when with_llm_clarity is omitted", async () => {
    const result = await gradeToolHandler({
      name: "search_tickets",
      description:
        "Use this when the user asks. It does the thing and returns it. Do not use otherwise.",
      input_schema: {
        type: "object",
        properties: { query: { type: "string", description: "Search query." } },
        required: ["query"],
      },
    });
    const text = (result.content[0] as { type: "text"; text: string }).text;
    const parsed = JSON.parse(text);
    const ids: string[] = parsed.issues.map(
      (i: { ruleId: string }) => i.ruleId
    );
    expect(ids.some((id) => id.startsWith("clarity-"))).toBe(false);
  });
});
