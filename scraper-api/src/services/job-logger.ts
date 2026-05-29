import { EventEmitter } from "node:events";

export type LogLevel = "info" | "success" | "warn" | "error";

export type JobLogEntry = {
  ts: string;
  level: LogLevel;
  message: string;
};

type JobLogState = {
  entries: JobLogEntry[];
  done: boolean;
};

// Simpan log scraping per job di memori (bukan database) supaya ringan.
// Cocok untuk menonton proses live; log hilang saat server restart, dan itu
// memang ekspektasinya untuk fitur ini.
const MAX_ENTRIES_PER_JOB = 500;
const RETENTION_MS = 10 * 60 * 1000; // simpan 10 menit setelah job selesai

const store = new Map<string, JobLogState>();
const emitter = new EventEmitter();
// Banyak koneksi SSE bisa mendengarkan satu job; naikkan batas listener.
emitter.setMaxListeners(0);

function channel(jobId: string) {
  return `log:${jobId}`;
}

function ensureState(jobId: string): JobLogState {
  let state = store.get(jobId);
  if (!state) {
    state = { entries: [], done: false };
    store.set(jobId, state);
  }
  return state;
}

export function logJob(jobId: string, level: LogLevel, message: string) {
  const state = ensureState(jobId);
  const entry: JobLogEntry = {
    ts: new Date().toISOString(),
    level,
    message
  };

  state.entries.push(entry);
  if (state.entries.length > MAX_ENTRIES_PER_JOB) {
    state.entries.splice(0, state.entries.length - MAX_ENTRIES_PER_JOB);
  }

  emitter.emit(channel(jobId), entry);

  // Cerminkan juga ke console server supaya tetap muncul di log Railway.
  const line = `[job ${jobId}] ${message}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function getJobLogs(jobId: string): JobLogEntry[] {
  return store.get(jobId)?.entries ?? [];
}

export function isJobDone(jobId: string) {
  return store.get(jobId)?.done ?? false;
}

export function subscribeJobLogs(jobId: string, listener: (entry: JobLogEntry) => void) {
  emitter.on(channel(jobId), listener);
  return () => emitter.off(channel(jobId), listener);
}

export function finishJobLog(jobId: string) {
  const state = ensureState(jobId);
  state.done = true;
  emitter.emit(channel(jobId), { ts: new Date().toISOString(), level: "info", message: "__done__" });

  // Bersihkan setelah masa retensi supaya memori tidak menumpuk.
  setTimeout(() => {
    store.delete(jobId);
  }, RETENTION_MS).unref?.();
}
