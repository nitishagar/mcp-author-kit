import { describe, it, expect } from "vitest";
import {
  gradeToolDescription,
  type ToolDescriptor,
} from "../../server/src/lib/rubric.js";

const wellFormed: ToolDescriptor = {
  name: "search_tickets",
  description:
    "Use this tool when the user wants to find support tickets matching a query, status, or assignee. " +
    "Returns up to 50 tickets ordered by recency. " +
    "Do not use when the user wants to modify a ticket — use update_ticket for that.",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Free-text search query." },
    },
    required: ["query"],
  },
};

describe("gradeToolDescription with the clarity pass off (default)", () => {
  it("never emits a clarity-* issue", () => {
    const result = gradeToolDescription(wellFormed);
    expect(result.issues.find((i) => i.ruleId.startsWith("clarity-"))).toBeUndefined();
  });

  it("opt-out is the default — explicit { withClarity: false } matches no-arg call", () => {
    const a = gradeToolDescription(wellFormed);
    const b = gradeToolDescription(wellFormed, { withClarity: false });
    expect(b.score).toBe(a.score);
    expect(b.issues).toEqual(a.issues);
  });
});

describe("gradeToolDescription with { withClarity: true }", () => {
  it("flags vague pronouns / unbound referents (it / this thing)", () => {
    const tool: ToolDescriptor = {
      ...wellFormed,
      description:
        "Use this when the user asks. It does the thing and returns it. Do not use otherwise.",
    };
    const result = gradeToolDescription(tool, { withClarity: true });
    const ids = result.issues.map((i) => i.ruleId);
    expect(ids).toContain("clarity-vague-referent");
  });

  it("flags excessive passive voice", () => {
    const tool: ToolDescriptor = {
      ...wellFormed,
      description:
        "Use this tool when tickets are being searched by an agent. " +
        "Tickets are returned by the system. Results are filtered by status. " +
        "Do not use when tickets are modified.",
    };
    const result = gradeToolDescription(tool, { withClarity: true });
    expect(result.issues.map((i) => i.ruleId)).toContain("clarity-passive-voice");
  });

  it("flags unexplained acronyms (3+ uppercase letters not introduced)", () => {
    const tool: ToolDescriptor = {
      ...wellFormed,
      description:
        "Use when the user wants to query the CRM via the SLA dashboard. " +
        "Returns a JSON list. Do not use for KPIs.",
    };
    const result = gradeToolDescription(tool, { withClarity: true });
    expect(result.issues.map((i) => i.ruleId)).toContain("clarity-unexplained-acronyms");
  });

  it("does NOT flag well-formed descriptions on any clarity rule", () => {
    const result = gradeToolDescription(wellFormed, { withClarity: true });
    const clarityIssues = result.issues.filter((i) =>
      i.ruleId.startsWith("clarity-")
    );
    expect(clarityIssues).toEqual([]);
  });

  it("clarity issues deduct points (score with clarity ≤ score without on a clarity-bad input)", () => {
    const tool: ToolDescriptor = {
      ...wellFormed,
      description:
        "Use this when the user asks. It does the thing and returns it. Do not use otherwise.",
    };
    const without = gradeToolDescription(tool);
    const withC = gradeToolDescription(tool, { withClarity: true });
    expect(withC.score).toBeLessThanOrEqual(without.score);
    expect(withC.issues.length).toBeGreaterThan(without.issues.length);
  });

  it("score remains in [0, 100]", () => {
    const tool: ToolDescriptor = {
      ...wellFormed,
      description: "It does it. This thing. CRM SLA KPI.",
    };
    const result = gradeToolDescription(tool, { withClarity: true });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
