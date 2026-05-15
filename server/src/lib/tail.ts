import { realSpawner, type Spawner, type SpawnRequest } from "./spawner.js";

export interface TailRequest extends Omit<SpawnRequest, "args"> {
  args?: string[];
  durationSeconds: number;
}

export interface TailResult {
  stderr: string;
  durationMs: number;
  timedOut: boolean;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
}

const MIN_DURATION_MS = 100;

export async function tailMcpLogs(
  req: TailRequest,
  spawner: Spawner = realSpawner
): Promise<TailResult> {
  const durationMs = Math.max(MIN_DURATION_MS, Math.floor(req.durationSeconds * 1000));
  const child = spawner.spawn({
    command: req.command,
    args: req.args ?? [],
    env: req.env,
    cwd: req.cwd,
  });

  const chunks: Buffer[] = [];
  child.stderr?.on("data", (chunk: Buffer | string) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  });

  const start = Date.now();
  let timedOut = false;

  const exit = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
    (resolveExit) => {
      child.once("exit", (code, signal) => resolveExit({ code, signal }));
      child.once("error", () => resolveExit({ code: null, signal: null }));
    }
  );

  const timer = new Promise<"timeout">((resolveTimer) => {
    setTimeout(() => {
      timedOut = true;
      try {
        child.kill("SIGTERM");
      } catch {
        // ignore
      }
      resolveTimer("timeout");
    }, durationMs);
  });

  const result = await Promise.race([exit, timer]);

  let exitCode: number | null = null;
  let signal: NodeJS.Signals | null = null;
  if (result !== "timeout") {
    exitCode = result.code;
    signal = result.signal;
  } else {
    // Wait briefly for the kill to flush
    const final = await Promise.race([
      exit,
      new Promise<{ code: null; signal: null }>((r) =>
        setTimeout(() => r({ code: null, signal: null }), 200)
      ),
    ]);
    exitCode = final.code;
    signal = final.signal;
  }

  return {
    stderr: Buffer.concat(chunks).toString("utf8"),
    durationMs: Date.now() - start,
    timedOut,
    exitCode,
    signal,
  };
}
