import { spawn, type ChildProcess } from "node:child_process";

export interface SpawnRequest {
  command: string;
  args?: string[];
  env?: NodeJS.ProcessEnv;
  cwd?: string;
}

export interface Spawner {
  spawn(req: SpawnRequest): ChildProcess;
}

export const realSpawner: Spawner = {
  spawn({ command, args = [], env, cwd }) {
    return spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, ...env },
      cwd,
    });
  },
};
