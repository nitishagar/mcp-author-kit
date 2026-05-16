#!/usr/bin/env node
// End-to-end local verification: spawn the bundled mcp-author-kit server,
// drive each of its 5 tools against the echo fixture, print a one-screen
// pass/fail report. Exits non-zero on any failure.

import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bundle = resolve(repo, "server/bundle/index.js");
const fixture = resolve(repo, "tests/fixtures/echo-server.mjs");

for (const p of [bundle, fixture]) {
  if (!existsSync(p)) {
    console.error(`verify-local: missing ${p}`);
    process.exit(1);
  }
}

const child = spawn("node", [bundle], { stdio: ["pipe", "pipe", "pipe"] });
const responses = new Map();
let stdoutBuf = "";
let nextId = 1;

child.stderr.on("data", (c) => process.stderr.write(c));
child.on("error", (e) => { fail(`spawn error: ${e.message}`); });

child.stdout.on("data", (chunk) => {
  stdoutBuf += chunk.toString("utf8");
  let nl;
  while ((nl = stdoutBuf.indexOf("\n")) !== -1) {
    const line = stdoutBuf.slice(0, nl).trim();
    stdoutBuf = stdoutBuf.slice(nl + 1);
    if (!line) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id != null) responses.set(msg.id, msg);
    } catch { /* skip non-JSON */ }
  }
});

const send = (obj) => child.stdin.write(JSON.stringify(obj) + "\n");
const waitFor = async (id, timeoutMs = 8000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (responses.has(id)) return responses.get(id);
    await new Promise((r) => setTimeout(r, 25));
  }
  fail(`timeout waiting for response id=${id}`);
};

const results = [];
const log = (name, ok, detail) => {
  results.push({ name, ok, detail });
  const tag = ok ? "PASS" : "FAIL";
  console.log(`  [${tag}] ${name}${detail ? "  — " + detail : ""}`);
};

const fail = (msg) => {
  console.error(`\nverify-local ABORT: ${msg}`);
  child.kill("SIGKILL");
  process.exit(1);
};

const callTool = async (name, args) => {
  const id = ++nextId;
  send({ jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: args } });
  const res = await waitFor(id);
  if (res.error) throw new Error(`${name} JSON-RPC error: ${JSON.stringify(res.error)}`);
  if (res.result?.isError) {
    const text = res.result.content?.[0]?.text ?? "<no text>";
    throw new Error(`${name} returned isError: ${text}`);
  }
  return res.result;
};

const text = (result) => result?.content?.find((c) => c.type === "text")?.text ?? "";

console.log("verify-local: spawning bundled server…");

// 1) initialize
send({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "verify-local", version: "0.0.0" },
  },
});
const init = await waitFor(1);
if (init.error) fail(`initialize: ${JSON.stringify(init.error)}`);
send({ jsonrpc: "2.0", method: "notifications/initialized" });

// 2) tools/list — must report 5 tools
const listId = ++nextId;
send({ jsonrpc: "2.0", id: listId, method: "tools/list" });
const listRes = await waitFor(listId);
const tools = listRes.result?.tools ?? [];
log(
  "tools/list returns 5 tools",
  tools.length === 5,
  tools.map((t) => t.name).join(", ")
);

// 3) inspect_mcp_server against the echo fixture
try {
  const r = await callTool("inspect_mcp_server", {
    command: "node",
    args: [fixture],
  });
  const body = text(r);
  const data = JSON.parse(body);
  const echoTool = data.tools?.find((t) => t.name === "echo");
  log("inspect_mcp_server finds echo tool", !!echoTool);
} catch (e) {
  log("inspect_mcp_server finds echo tool", false, e.message);
}

// 4) grade_tool_description on echo's spec
try {
  const r = await callTool("grade_tool_description", {
    name: "echo",
    description:
      "Use when the user wants to echo a string back. Do not use to transform the message.",
    input_schema: {
      type: "object",
      properties: { msg: { type: "string", description: "Message to echo back verbatim." } },
      required: ["msg"],
    },
  });
  const body = text(r);
  const data = JSON.parse(body);
  log(
    "grade_tool_description returns numeric score",
    typeof data.score === "number",
    `score=${data.score}`
  );
} catch (e) {
  log("grade_tool_description returns numeric score", false, e.message);
}

// 5) tail_mcp_logs against echo fixture (short window)
try {
  const r = await callTool("tail_mcp_logs", {
    command: "node",
    args: [fixture],
    duration_seconds: 1,
  });
  // tail returns the captured stderr; echo fixture is silent, but the call must succeed.
  log("tail_mcp_logs completes the window", true, `len=${text(r).length}`);
} catch (e) {
  log("tail_mcp_logs completes the window", false, e.message);
}

// 6) call_mcp_tool: echo msg=hi → response contains "hi"
try {
  const r = await callTool("call_mcp_tool", {
    command: "node",
    args: [fixture],
    tool_name: "echo",
    arguments: { msg: "hi" },
  });
  const body = text(r);
  log("call_mcp_tool echo msg=hi returns 'hi'", body.includes("hi"));
} catch (e) {
  log("call_mcp_tool echo msg=hi returns 'hi'", false, e.message);
}

// 7) generate_smoke_tests produces a markdown plan
try {
  const r = await callTool("generate_smoke_tests", {
    command: "node",
    args: [fixture],
  });
  const body = text(r);
  log(
    "generate_smoke_tests returns a markdown plan",
    body.length > 50 && /echo/i.test(body),
    `${body.length} chars`
  );
} catch (e) {
  log("generate_smoke_tests returns a markdown plan", false, e.message);
}

child.kill("SIGTERM");

const failed = results.filter((r) => !r.ok);
console.log(
  `\n${results.length - failed.length}/${results.length} checks passed`
);
if (failed.length > 0) {
  console.error(`FAILED: ${failed.map((f) => f.name).join("; ")}`);
  process.exit(1);
}
console.log("verify-local OK");
process.exit(0);
