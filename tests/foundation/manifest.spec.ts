import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..", "..");
const readJson = (p: string) => JSON.parse(readFileSync(resolve(root, p), "utf8"));

describe("plugin manifest", () => {
  const manifest = readJson(".cursor-plugin/plugin.json");

  it("has a stable name and semver version", () => {
    expect(manifest.name).toBe("mcp-author-kit");
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("declares author, homepage, and license", () => {
    expect(manifest.author?.name).toBe("Nitish Agarwal");
    expect(manifest.homepage).toBe("https://github.com/nitishagar/mcp-author-kit");
    expect(manifest.license).toBe("MIT");
  });

  it("lists discoverability keywords", () => {
    expect(manifest.keywords).toEqual(
      expect.arrayContaining(["mcp", "model-context-protocol"])
    );
  });
});

describe("mcp.json", () => {
  const mcp = readJson("mcp.json");

  it("registers the bundled mcp-author-kit server over stdio", () => {
    expect(mcp.mcpServers?.["mcp-author-kit"]).toMatchObject({
      command: "node",
      transport: "stdio",
    });
    expect(mcp.mcpServers["mcp-author-kit"].args).toContain(
      "./server/dist/index.js"
    );
  });
});

describe("package.json", () => {
  const pkg = readJson("package.json");

  it("targets Node 20+ and ESM", () => {
    expect(pkg.engines?.node).toMatch(/>=\s*20/);
    expect(pkg.type).toBe("module");
  });

  it("wires up vitest and the MCP SDK", () => {
    expect(pkg.devDependencies?.vitest).toBeDefined();
    expect(pkg.dependencies?.["@modelcontextprotocol/sdk"]).toBeDefined();
  });
});
