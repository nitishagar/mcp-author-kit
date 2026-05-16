import { clarityIssues } from "./clarity.js";

export type Severity = "error" | "warn" | "info";

export interface SchemaProperty {
  type?: string | string[];
  description?: string;
  enum?: unknown[];
  items?: unknown;
  [key: string]: unknown;
}

export interface InputSchema {
  type: "object";
  properties: Record<string, SchemaProperty>;
  required?: string[];
}

export interface ToolDescriptor {
  name: string;
  description: string;
  input_schema: InputSchema;
}

export interface RubricIssue {
  ruleId: string;
  severity: Severity;
  points: number;
  message: string;
  fix?: string;
}

export interface GradeResult {
  score: number;
  issues: RubricIssue[];
}

interface Rule {
  id: string;
  run(tool: ToolDescriptor): RubricIssue[];
}

const VAGUE_VERBS = new Set([
  "do", "process", "handle", "manage", "run", "execute", "perform", "operate", "stuff",
]);

const TRIGGER_PATTERNS: RegExp[] = [
  /\buse when\b/i,
  /\buse this (tool|skill) when\b/i,
  /\bwhen the user\b/i,
  /\bwhen authoring\b/i,
  /\binvoke when\b/i,
  /\bif the user\b/i,
];

const NEGATIVE_PATTERNS: RegExp[] = [
  /\bdo not use\b/i,
  /\bdon'?t use\b/i,
  /\bnot for\b/i,
  /\bavoid (when|if)\b/i,
  /\bskip when\b/i,
];

const SNAKE_CASE = /^[a-z][a-z0-9_]*$/;

function isBlank(s: string | undefined): boolean {
  return !s || s.trim().length === 0;
}

const descriptionMissing: Rule = {
  id: "description-missing",
  run: (t) =>
    isBlank(t.description)
      ? [{
          ruleId: "description-missing",
          severity: "error",
          points: 30,
          message: "Tool has no description. Agents will not know when to use it.",
          fix: "Write 1–3 sentences: when to use it, what it returns, when not to use it.",
        }]
      : [],
};

const descriptionTooShort: Rule = {
  id: "description-too-short",
  run: (t) => {
    if (isBlank(t.description)) return [];
    return t.description.trim().length < 40
      ? [{
          ruleId: "description-too-short",
          severity: "warn",
          points: 12,
          message: `Description is only ${t.description.trim().length} characters. Agents need ~40+ chars to route reliably.`,
          fix: "Expand to cover trigger conditions, return shape, and when *not* to use the tool.",
        }]
      : [];
  },
};

const descriptionTooLong: Rule = {
  id: "description-too-long",
  run: (t) => {
    if (isBlank(t.description)) return [];
    return t.description.length > 300
      ? [{
          ruleId: "description-too-long",
          severity: "warn",
          points: 8,
          message: `Description is ${t.description.length} characters. Agents commonly truncate around 200; trim or move detail to schema field descriptions.`,
        }]
      : [];
  },
};

const missingTriggerLanguage: Rule = {
  id: "missing-trigger-language",
  run: (t) => {
    if (isBlank(t.description)) return [];
    const has = TRIGGER_PATTERNS.some((re) => re.test(t.description));
    return has
      ? []
      : [{
          ruleId: "missing-trigger-language",
          severity: "warn",
          points: 10,
          message: 'Description does not state when to invoke the tool. Add a "Use when…" or "When the user…" clause.',
        }];
  },
};

const missingNegativeGuidance: Rule = {
  id: "missing-negative-guidance",
  run: (t) => {
    if (isBlank(t.description)) return [];
    const has = NEGATIVE_PATTERNS.some((re) => re.test(t.description));
    return has
      ? []
      : [{
          ruleId: "missing-negative-guidance",
          severity: "warn",
          points: 12,
          message: 'Description does not say when *not* to use this tool. Adding "Do not use when…" is one of the highest-leverage edits.',
        }];
  },
};

const schemaNoProperties: Rule = {
  id: "schema-no-properties",
  run: (t) => {
    const props = t.input_schema?.properties ?? {};
    return Object.keys(props).length === 0
      ? [{
          ruleId: "schema-no-properties",
          severity: "warn",
          points: 10,
          message: "input_schema declares no properties. If the tool truly takes no inputs, document that in the description.",
        }]
      : [];
  },
};

const schemaPropertyMissingDescription: Rule = {
  id: "schema-property-missing-description",
  run: (t) => {
    const props = t.input_schema?.properties ?? {};
    const issues: RubricIssue[] = [];
    for (const [name, prop] of Object.entries(props)) {
      if (isBlank(prop?.description)) {
        issues.push({
          ruleId: "schema-property-missing-description",
          severity: "warn",
          points: 6,
          message: `Schema property "${name}" has no description. Agents will guess at meaning.`,
          fix: `Add a "description" field to ${name}.`,
        });
      }
    }
    return issues;
  },
};

const schemaPropertyMissingType: Rule = {
  id: "schema-property-missing-type",
  run: (t) => {
    const props = t.input_schema?.properties ?? {};
    const issues: RubricIssue[] = [];
    for (const [name, prop] of Object.entries(props)) {
      if (!prop || prop.type === undefined || prop.type === null || (typeof prop.type === "string" && prop.type.length === 0)) {
        issues.push({
          ruleId: "schema-property-missing-type",
          severity: "error",
          points: 8,
          message: `Schema property "${name}" has no "type". The tool will be unusable from strict clients.`,
          fix: `Add a JSON Schema type to ${name} (e.g. "string", "number").`,
        });
      }
    }
    return issues;
  },
};

const nameNotSnakeCase: Rule = {
  id: "name-not-snake-case",
  run: (t) =>
    SNAKE_CASE.test(t.name)
      ? []
      : [{
          ruleId: "name-not-snake-case",
          severity: "warn",
          points: 5,
          message: `Tool name "${t.name}" is not snake_case. Most MCP examples and host UIs assume snake_case.`,
        }],
};

const nameVagueVerb: Rule = {
  id: "name-vague-verb",
  run: (t) => {
    const head = t.name.split(/[_\W]+/).filter(Boolean)[0]?.toLowerCase() ?? "";
    return VAGUE_VERBS.has(head)
      ? [{
          ruleId: "name-vague-verb",
          severity: "warn",
          points: 6,
          message: `Tool name starts with the vague verb "${head}". Prefer a specific verb (search, fetch, create, grade, …).`,
        }]
      : [];
  },
};

const RULES: Rule[] = [
  descriptionMissing,
  descriptionTooShort,
  descriptionTooLong,
  missingTriggerLanguage,
  missingNegativeGuidance,
  schemaNoProperties,
  schemaPropertyMissingDescription,
  schemaPropertyMissingType,
  nameNotSnakeCase,
  nameVagueVerb,
];

export interface GradeOptions {
  withClarity?: boolean;
}

export function gradeToolDescription(
  tool: ToolDescriptor,
  options: GradeOptions = {}
): GradeResult {
  const issues = RULES.flatMap((r) => r.run(tool));
  if (options.withClarity) {
    issues.push(...clarityIssues(tool));
  }
  issues.sort((a, b) => b.points - a.points);
  const totalDeduction = issues.reduce((sum, i) => sum + i.points, 0);
  const score = Math.max(0, 100 - totalDeduction);
  return { score, issues };
}
