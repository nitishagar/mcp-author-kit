import type { RubricIssue, ToolDescriptor } from "./rubric.js";

// Heuristic clarity pass — deterministic, no LLM.
//
// The flag is named `with_llm_clarity` for forward-compatibility: a future
// version may move these checks to host-provided MCP sampling. Today the
// implementation is purely string heuristics, so the score is reproducible
// across runs and clients.

const VAGUE_REFERENT_PATTERNS: RegExp[] = [
  /\bit does\b/i,
  /\breturns it\b/i,
  /\bthis thing\b/i,
  /\bthe thing\b/i,
  /\bdoes the thing\b/i,
  /\bdo the thing\b/i,
];

const PASSIVE_PATTERN =
  /\b(is|are|was|were|be|been|being)\s+(\w+ed|searched|returned|filtered|modified|created|deleted|updated|fetched|written)\b/gi;

const ACRONYM_PATTERN = /\b[A-Z]{3,}\b/g;
const ACRONYM_INTRO_NEAR = (acr: string) =>
  new RegExp(`\\b${acr}\\b\\s*\\([^)]+\\)|\\b\\([^)]*${acr}[^)]*\\)`);

export function clarityIssues(tool: ToolDescriptor): RubricIssue[] {
  const out: RubricIssue[] = [];
  const desc = tool.description ?? "";
  if (desc.trim().length === 0) return out;

  if (VAGUE_REFERENT_PATTERNS.some((re) => re.test(desc))) {
    out.push({
      ruleId: "clarity-vague-referent",
      severity: "warn",
      points: 8,
      message:
        "Description uses vague referents (e.g. \"it\", \"the thing\", \"does the thing\"). " +
        "Agents route on concrete nouns; replace with the actual entity.",
      fix: "Rewrite each \"it\" / \"the thing\" with the specific noun (ticket, file, message, …).",
    });
  }

  const passiveMatches = desc.match(PASSIVE_PATTERN) ?? [];
  if (passiveMatches.length >= 2) {
    out.push({
      ruleId: "clarity-passive-voice",
      severity: "warn",
      points: 6,
      message:
        `Description is heavily passive (${passiveMatches.length} passive constructions). ` +
        "Agents route better on active-voice triggers (\"Use when the user asks…\").",
      fix: "Rewrite passive clauses in active voice with an explicit subject.",
    });
  }

  const acronyms = new Set((desc.match(ACRONYM_PATTERN) ?? []));
  const unintroduced = [...acronyms].filter(
    (a) => !ACRONYM_INTRO_NEAR(a).test(desc) && a !== "JSON" && a !== "MCP" && a !== "API" && a !== "HTTP" && a !== "URL" && a !== "URI"
  );
  if (unintroduced.length > 0) {
    out.push({
      ruleId: "clarity-unexplained-acronyms",
      severity: "info",
      points: 3,
      message:
        `Description contains unexplained acronyms: ${unintroduced.join(", ")}. ` +
        "Agents (and humans) route worse on undefined jargon.",
      fix: "Spell out the acronym on first use, e.g. \"customer relationship management (CRM)\".",
    });
  }

  return out;
}
