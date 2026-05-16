#!/usr/bin/env node
// Boots the bundled MCP server, sends initialize + tools/list over stdio,
// and asserts the server responds with >= 5 tools. Exits 0 on success.

import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const bundle = resolve(process.cwd(), "server/bundle/index.js");
if (!existsSync(bundle)) {
  console.error(`smoke-boot: bundle not found at ${bundle}`);
  process.exit(1);
}

const child = spawn("node", [bundle], {
  stdio: ["pipe", "pipe", "pipe"],
  cwd: "/tmp",
});

let stdoutBuf = "";
const responses = new Map();
let timeoutHandle;

const fail = (msg) => {
  clearTimeout(timeoutHandle);
  console.error(`smoke-boot FAIL: ${msg}`);
  child.kill("SIGKILL");
  process.exit(1);
};

timeoutHandle = setTimeout(() => fail("timed out after 5s"), 5000);

child.on("error", (err) => fail(`spawn error: ${err.message}`));
child.stderr.on("data", (chunk) => process.stderr.write(chunk));

child.stdout.on("data", (chunk) => {
  stdoutBuf += chunk.toString("utf8");
  let nl;
  while ((nl = stdoutBuf.indexOf("\n")) !== -1) {
    const line = stdoutBuf.slice(0, nl).trim();
    stdoutBuf = stdoutBuf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    if (msg.id != null) responses.set(msg.id, msg);
  }
});

const send = (obj) => child.stdin.write(JSON.stringify(obj) + "\n");

const waitFor = async (id) => {
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    if (responses.has(id)) return responses.get(id);
    await new Promise((r) => setTimeout(r, 25));
  }
  fail(`no response for id=${id}`);
};

send({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "smoke-boot", version: "0.0.0" },
  },
});

const initRes = await waitFor(1);
if (initRes.error) fail(`initialize error: ${JSON.stringify(initRes.error)}`);

send({ jsonrpc: "2.0", method: "notifications/initialized" });
send({ jsonrpc: "2.0", id: 2, method: "tools/list" });

const listRes = await waitFor(2);
if (listRes.error) fail(`tools/list error: ${JSON.stringify(listRes.error)}`);

const tools = listRes.result?.tools ?? [];
if (tools.length < 5) fail(`expected >=5 tools, got ${tools.length}`);

clearTimeout(timeoutHandle);
console.log(`smoke-boot OK: ${tools.length} tools — ${tools.map((t) => t.name).join(", ")}`);
child.kill("SIGTERM");
process.exit(0);
