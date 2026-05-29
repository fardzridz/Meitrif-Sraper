"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import type { JobLogEntry } from "@/lib/api";

const levelColor: Record<JobLogEntry["level"], string> = {
  info: "text-slate-300",
  success: "text-emerald-400",
  warn: "text-amber-400",
  error: "text-red-400"
};

const levelLabel: Record<JobLogEntry["level"], string> = {
  info: "INFO",
  success: " OK ",
  warn: "WARN",
  error: "ERR "
};

function formatTime(ts: string) {
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "--:--:--";
  return date.toLocaleTimeString("id-ID", { hour12: false });
}

export function ScrapeTerminal({
  entries,
  running
}: {
  entries: JobLogEntry[];
  running: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke bawah setiap ada log baru.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [entries]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-950 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-amber-500/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
        </span>
        <div className="ml-2 flex items-center gap-2 text-sm font-medium text-slate-300">
          <Terminal size={15} aria-hidden="true" />
          scraper@metrif: ~
        </div>
        {running ? (
          <span className="ml-auto flex items-center gap-2 text-xs font-medium text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            live
          </span>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Log proses scraping"
        className="h-72 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-6"
      >
        {entries.length === 0 ? (
          <p className="text-slate-500">
            $ menunggu job scraping... log proses akan tampil di sini secara realtime.
          </p>
        ) : (
          entries.map((entry, index) => (
            <div key={`${entry.ts}-${index}`} className="flex gap-3 whitespace-pre-wrap break-words">
              <span className="shrink-0 text-slate-600">{formatTime(entry.ts)}</span>
              <span className={`shrink-0 font-semibold ${levelColor[entry.level]}`}>
                [{levelLabel[entry.level]}]
              </span>
              <span className="text-slate-200">{entry.message}</span>
            </div>
          ))
        )}
        {running ? (
          <div className="mt-1 flex gap-2 text-slate-200">
            <span className="text-emerald-400">$</span>
            <span className="inline-block h-4 w-2 animate-pulse bg-slate-300" aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
