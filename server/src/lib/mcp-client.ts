import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export interface InspectionTarget {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface InspectionReport {
  serverInfo: { name: string; version?: string } | null;
  tools: unknown[];
  resources: unknown[];
  prompts: unknown[];
  warnings: string[];
}

const KIND = ["tools", "resources", "prompts"] as const;
type Kind = (typeof KIND)[number];

async function safeList(client: Client, kind: Kind): Promise<{ items: unknown[]; warning?: string }> {
  try {
    if (kind === "tools") {
      const res = await client.listTools();
      return { items: res.tools ?? [] };
    }
    if (kind === "resources") {
      const res = await client.listResources();
      return { items: res.resources ?? [] };
    }
    const res = await client.listPrompts();
    return { items: res.prompts ?? [] };
  } catch (err) {
    return {
      items: [],
      warning: `Could not list ${kind}: ${(err as Error).message ?? String(err)}`,
    };
  }
}

export async function inspect(target: InspectionTarget): Promise<InspectionReport> {
  const transport = new StdioClientTransport({
    command: target.command,
    args: target.args ?? [],
    env: target.env,
  });
  const client = new Client(
    { name: "mcp-author-kit-inspector", version: "0.2.0" },
    { capabilities: {} }
  );

  const warnings: string[] = [];
  let serverInfo: InspectionReport["serverInfo"] = null;

  try {
    await client.connect(transport);
    const info = client.getServerVersion();
    if (info) serverInfo = { name: info.name, version: info.version };

    const [tools, resources, prompts] = await Promise.all([
      safeList(client, "tools"),
      safeList(client, "resources"),
      safeList(client, "prompts"),
    ]);

    if (tools.warning) warnings.push(tools.warning);
    if (resources.warning) warnings.push(resources.warning);
    if (prompts.warning) warnings.push(prompts.warning);

    return {
      serverInfo,
      tools: tools.items,
      resources: resources.items,
      prompts: prompts.items,
      warnings,
    };
  } finally {
    try {
      await client.close();
    } catch {
      // best-effort close
    }
  }
}
