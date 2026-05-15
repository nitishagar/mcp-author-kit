import { describe, it, expect } from "vitest";
import { gradeToolDescription, type ToolDescriptor } from "../../server/src/lib/rubric.js";

const wellFormed: ToolDescriptor = {
  name: "search_tickets",
  description:
    "Use this tool when the user wants to find support tickets matching a query, status, or assignee. " +
    "Returns up to 50 tickets ordered by recency. " +
    "Do not use when the user wants to *modify* a ticket — use update_ticket for that.",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Free-text search query." },
      status: {
        type: "string",
        description: "Filter by ticket status (open, closed, pending).",
        enum: ["open", "closed", "pending"],
      },
    },
    required: ["query"],
  },
};

describe("gradeToolDescription", () => {
  describe("happy path", () => {
    it("scores a well-formed tool >= 85 with no error-severity issues", () => {
      const result = gradeToolDescription(wellFormed);
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.issues.filter((i) => i.severity === "error")).toEqual([]);
    });

    it("returns a numeric score in [0, 100]", () => {
      const result = gradeToolDescription(wellFormed);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe("description rules", () => {
    it("flags an empty description as an error", () => {
      const result = gradeToolDescription({ ...wellFormed, description: "" });
      const ids = result.issues.map((i) => i.ruleId);
      expect(ids).toContain("description-missing");
      expect(result.issues.find((i) => i.ruleId === "description-missing")?.severity).toBe("error");
    });

    it("warns when description is shorter than 40 characters", () => {
      const result = gradeToolDescription({ ...wellFormed, description: "Searches stuff." });
      expect(result.issues.map((i) => i.ruleId)).toContain("description-too-short");
    });

    it("warns when description exceeds 300 characters (agents truncate near 200)", () => {
      const long = "x".repeat(310);
      const result = gradeToolDescription({ ...wellFormed, description: long });
      expect(result.issues.map((i) => i.ruleId)).toContain("description-too-long");
    });

    it("warns when 'when not to use' guidance is absent", () => {
      const result = gradeToolDescription({
        ...wellFormed,
        description:
          "Use this tool when the user wants to find support tickets matching a query. Returns up to 50 tickets.",
      });
      expect(result.issues.map((i) => i.ruleId)).toContain("missing-negative-guidance");
    });

    it("warns when no triggering language is present", () => {
      const result = gradeToolDescription({
        ...wellFormed,
        description:
          "Searches the support ticket database. Returns matches. Do not use for modifications. " +
          "Returns at most 50 results ordered by recency to keep payloads small.",
      });
      expect(result.issues.map((i) => i.ruleId)).toContain("missing-trigger-language");
    });
  });

  describe("input schema rules", () => {
    it("warns when a property is missing its description", () => {
      const tool: ToolDescriptor = {
        ...wellFormed,
        input_schema: {
          type: "object",
          properties: {
            query: { type: "string" }, // no description
          },
          required: ["query"],
        },
      };
      const result = gradeToolDescription(tool);
      const issue = result.issues.find((i) => i.ruleId === "schema-property-missing-description");
      expect(issue).toBeDefined();
      expect(issue?.message).toMatch(/query/);
    });

    it("errors when a property is missing its type", () => {
      const tool: ToolDescriptor = {
        ...wellFormed,
        input_schema: {
          type: "object",
          properties: {
            query: { description: "Free-text search query." } as unknown as { type: string },
          },
          required: ["query"],
        },
      };
      const result = gradeToolDescription(tool);
      const issue = result.issues.find((i) => i.ruleId === "schema-property-missing-type");
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe("error");
    });

    it("warns when input_schema declares no properties at all", () => {
      const tool: ToolDescriptor = {
        ...wellFormed,
        input_schema: { type: "object", properties: {} },
      };
      const result = gradeToolDescription(tool);
      expect(result.issues.map((i) => i.ruleId)).toContain("schema-no-properties");
    });
  });

  describe("name rules", () => {
    it("warns on non-snake_case tool names", () => {
      const result = gradeToolDescription({ ...wellFormed, name: "SearchTickets" });
      expect(result.issues.map((i) => i.ruleId)).toContain("name-not-snake-case");
    });

    it("warns on vague verbs in tool names", () => {
      const result = gradeToolDescription({ ...wellFormed, name: "do_thing" });
      expect(result.issues.map((i) => i.ruleId)).toContain("name-vague-verb");
    });
  });

  describe("scoring", () => {
    it("monotonically decreases as more issues stack", () => {
      const broken: ToolDescriptor = {
        name: "DoStuff",
        description: "stuff",
        input_schema: {
          type: "object",
          properties: { x: {} as { type: string } },
        },
      };
      const a = gradeToolDescription(wellFormed).score;
      const b = gradeToolDescription({ ...wellFormed, description: "" }).score;
      const c = gradeToolDescription(broken).score;
      expect(a).toBeGreaterThan(b);
      expect(b).toBeGreaterThan(c);
    });

    it("never returns a negative score", () => {
      const garbage: ToolDescriptor = {
        name: "X",
        description: "",
        input_schema: { type: "object", properties: {} },
      };
      expect(gradeToolDescription(garbage).score).toBeGreaterThanOrEqual(0);
    });

    it("orders issues by points descending so highest-impact fixes appear first", () => {
      const broken: ToolDescriptor = {
        name: "DoStuff",
        description: "x",
        input_schema: {
          type: "object",
          properties: { x: {} as { type: string } },
        },
      };
      const result = gradeToolDescription(broken);
      const points = result.issues.map((i) => i.points);
      const sorted = [...points].sort((a, b) => b - a);
      expect(points).toEqual(sorted);
    });
  });
});
