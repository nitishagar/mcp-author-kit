import { inspect, type InspectionTarget } from "./mcp-client.js";
import { gradeToolDescription, type ToolDescriptor } from "./rubric.js";

export interface ToolPlan {
  name: string;
  description: string;
  score: number;
  topIssue: string | null;
  positivePrompts: string[];
  negativePrompts: string[];
}

export interface SmokePlan {
  serverName: string | null;
  tools: ToolPlan[];
  markdown: string;
}

interface RemoteTool {
  name: string;
  description?: string;
  inputSchema?: ToolDescriptor["input_schema"];
}

export const NEGATIVE_TEMPLATES = [
  "Help me write a grocery list.",
  "Summarise the latest US tax code changes.",
  "Refactor this Python function for readability.",
];

const NEAR_MISS_BY_VERB: Record<string, (noun: string) => string> = {
  echo: () => "Log this message to the console.",
  log: (n) => `Print the ${n || "value"} to stdout instead.`,
  print: (n) => `Log the ${n || "value"} to a file instead.`,
  create: (n) => `Delete the ${n || "record"} instead.`,
  add: (n) => `Remove the ${n || "item"} instead.`,
  insert: (n) => `Remove the ${n || "row"} instead.`,
  make: (n) => `Destroy the ${n || "thing"} instead.`,
  get: (n) => `Update the ${n || "record"} instead.`,
  read: (n) => `Update the ${n || "record"} instead.`,
  list: (n) => `Update the ${n || "record"} instead.`,
  fetch: (n) => `Update the ${n || "record"} instead.`,
  show: (n) => `Update the ${n || "record"} instead.`,
  delete: (n) => `Restore the ${n || "record"} instead.`,
  remove: (n) => `Restore the ${n || "record"} instead.`,
  drop: (n) => `Restore the ${n || "record"} instead.`,
  update: (n) => `Read the ${n || "record"} instead.`,
  set: (n) => `Read the ${n || "value"} instead.`,
  start: (n) => `Stop the ${n || "process"} instead.`,
  stop: (n) => `Start the ${n || "process"} instead.`,
  open: (n) => `Close the ${n || "handle"} instead.`,
  close: (n) => `Open the ${n || "handle"} instead.`,
};

export function nearMissNegativeFor(tool: { name: string }): string {
  const parts = tool.name.split("_");
  const verb = (parts[0] ?? tool.name).toLowerCase();
  const noun = parts.slice(1).join(" ").toLowerCase();
  const fn = NEAR_MISS_BY_VERB[verb];
  if (fn) return fn(noun);
  return `Use a different ${noun || tool.name} tool instead.`;
}

function positivePromptsFor(tool: RemoteTool): string[] {
  const verb = tool.name.split("_")[0] ?? tool.name;
  const noun = tool.name.split("_").slice(1).join(" ") || "the input";
  return [
    `${capitalize(verb)} ${noun}: "<sample input>".`,
    `Please ${verb.toLowerCase()} ${noun} for this case.`,
  ];
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

function renderMarkdown(serverName: string | null, plans: ToolPlan[]): string {
  const header = `# Smoke test plan${serverName ? ` for ${serverName}` : ""}`;
  const sections = plans.map((p) => {
    const issueLine = p.topIssue ? `\n> Top rubric issue: ${p.topIssue}` : "";
    const positives = p.positivePrompts.map((q, i) => `  ${i + 1}. \`${q}\``).join("\n");
    const negatives = p.negativePrompts.map((q, i) => `  ${i + 1}. \`${q}\``).join("\n");
    return [
      `## Tool: \`${p.name}\` (rubric score: ${p.score}/100)${issueLine}`,
      "",
      "**Prompts that should invoke this tool:**",
      positives,
      "",
      "**Prompts that should NOT invoke this tool:**",
      negatives,
      "",
    ].join("\n");
  });
  return [header, "", ...sections].join("\n");
}

export async function generateSmokeTests(target: InspectionTarget): Promise<SmokePlan> {
  const report = await inspect(target);
  const remoteTools = (report.tools ?? []) as RemoteTool[];

  const plans: ToolPlan[] = remoteTools.map((t) => {
    const grade = gradeToolDescription({
      name: t.name,
      description: t.description ?? "",
      input_schema: t.inputSchema ?? { type: "object", properties: {} },
    });
    return {
      name: t.name,
      description: t.description ?? "",
      score: grade.score,
      topIssue: grade.issues[0]?.message ?? null,
      positivePrompts: positivePromptsFor(t),
      negativePrompts: [nearMissNegativeFor(t), NEGATIVE_TEMPLATES[0]!],
    };
  });

  return {
    serverName: report.serverInfo?.name ?? null,
    tools: plans,
    markdown: renderMarkdown(report.serverInfo?.name ?? null, plans),
  };
}
