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

const NEGATIVE_TEMPLATES = [
  "Help me write a grocery list.",
  "Summarise the latest US tax code changes.",
  "Refactor this Python function for readability.",
];

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
      negativePrompts: NEGATIVE_TEMPLATES.slice(0, 2),
    };
  });

  return {
    serverName: report.serverInfo?.name ?? null,
    tools: plans,
    markdown: renderMarkdown(report.serverInfo?.name ?? null, plans),
  };
}
