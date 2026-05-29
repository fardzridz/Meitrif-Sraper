"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Play, RotateCw, SearchCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { ScrapeTerminal } from "@/components/scrape-terminal";
import { formatDate, formatJobStatus, formatStopReason, isFemaleDailyReviewUrl } from "@/lib/utils";
import {
  checkScrapeState,
  getJob,
  getJobs,
  startScrape,
  streamJobLogs,
  type JobLogEntry,
  type ScrapeState
} from "@/lib/api";
import type { JobStatus, ScrapeJob } from "@/lib/types";

type ScrapeMode = "refresh" | "continue";

export default function ScrapePage() {
  const [url, setUrl] = useState("");
  const [maxReviews, setMaxReviews] = useState(10);
  const [mode, setMode] = useState<ScrapeMode>("refresh");
  const [scrapeState, setScrapeState] = useState<ScrapeState | null>(null);
  const [status, setStatus] = useState<JobStatus | "idle" | "validating">("idle");
  const [message, setMessage] = useState("Masukkan URL produk FemaleDaily untuk memulai job scraping.");
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [activeJobId, setActiveJobId] = useState("");
  const [activeJob, setActiveJob] = useState<ScrapeJob | null>(null);
  const [logs, setLogs] = useState<JobLogEntry[]>([]);
  const isProcessing = status === "validating" || status === "running";

  async function loadJobs() {
    setJobsLoading(true);
    setJobsError("");
    try {
      const data = await getJobs();
      setJobs(data.slice(0, 10));
    } catch (requestError) {
      setJobsError(requestError instanceof Error ? requestError.message : "Gagal memuat riwayat scrape.");
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }

  useEffect(() => {
    void loadJobs();
  }, []);

  // Cek apakah URL ini sudah pernah di-scrape owner, supaya bisa menawarkan
  // mode refresh (ambil review terbaru) atau continue (gali lebih dalam).
  useEffect(() => {
    if (!url.trim() || !isFemaleDailyReviewUrl(url)) {
      setScrapeState(null);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      checkScrapeState(url)
        .then((state) => {
          if (!active) return;
          setScrapeState(state);
          // Default tetap refresh; user bisa pindah ke continue kalau mau gali lebih dalam.
          if (!state.exists) setMode("refresh");
        })
        .catch(() => {
          if (active) setScrapeState(null);
        });
    }, 500);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [url]);

  useEffect(() => {
    if (!activeJobId) return;

    let active = true;
    const poll = async () => {
      try {
        const job = await getJob(activeJobId);
        if (!active) return;

        setActiveJob(job);
        setStatus(job.status);

        const progress = `${job.total_reviews} / ${job.requested_reviews ?? maxReviews} review`;
        if (job.status === "running" || job.status === "pending") {
          setMessage(`Sedang scraping data produk. Progress sementara: ${progress}.`);
          return;
        }

        if (job.status === "success") {
          const reason = formatStopReason(job.stop_reason);
          setMessage(
            `Scraping selesai. Terkumpul ${progress}${reason ? `, ${reason.toLowerCase()}` : ""}.`
          );
          setActiveJobId("");
          void loadJobs();
          return;
        }

        if (job.status === "failed") {
          setMessage(`Scraping gagal. ${job.error_message ?? "Silakan cek backend scraper."}`);
          setActiveJobId("");
          void loadJobs();
        }
      } catch (requestError) {
        if (!active) return;
        setStatus("failed");
        setMessage(
          requestError instanceof Error
            ? requestError.message
            : "Gagal membaca status job dari backend."
        );
        setActiveJobId("");
      }
    };

    void poll();
    const interval = window.setInterval(() => void poll(), 3000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [activeJobId, maxReviews]);

  // Stream log scraping realtime selama job aktif.
  useEffect(() => {
    if (!activeJobId) return;

    const stop = streamJobLogs(activeJobId, {
      onEntry: (entry) => setLogs((current) => [...current, entry]),
      onError: (streamError) =>
        setLogs((current) => [
          ...current,
          { ts: new Date().toISOString(), level: "warn", message: `Log stream terputus: ${streamError.message}` }
        ])
    });

    return () => stop();
  }, [activeJobId]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("validating");
    setError("");

    if (!url.trim()) {
      setStatus("idle");
      setError("URL produk wajib diisi.");
      return;
    }

    if (!isFemaleDailyReviewUrl(url)) {
      setStatus("idle");
      setError("Gunakan URL HTTPS dari domain FemaleDaily dan bukan halaman profil/login.");
      return;
    }
    const normalizedMaxReviews = Math.min(Math.max(Math.ceil(maxReviews / 10) * 10, 10), 250);

    setStatus("running");
    setMessage(
      `Job dikirim ke scraper backend. Target ${normalizedMaxReviews} review, scraper akan berhenti lebih awal kalau review habis.`
    );

    try {
      const result = await startScrape(url, normalizedMaxReviews, mode);
      setStatus("running");
      setLogs([]);
      setActiveJobId(result.jobId);
      setActiveJob({
        id: result.jobId,
        source_url: url,
        status: "running",
        total_reviews: 0,
        requested_reviews: result.requestedReviews,
        started_at: new Date().toISOString(),
        finished_at: null,
        created_at: new Date().toISOString()
      });
      setMessage(
        `Job scraping berhasil dibuat. Sedang mencari data untuk target ${result.requestedReviews} review.`
      );
      void loadJobs();
    } catch (requestError) {
      setStatus("failed");
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : "Scraper API belum tersedia atau request gagal."
      );
    }
  }

  return (
    <>
      <PageHeader
        title="Scrape Product"
        description="Input satu URL produk FemaleDaily, validasi formatnya, lalu buat job scraping ke backend terpisah."
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="relative overflow-hidden">
          {isProcessing ? (
            <div className="absolute left-0 right-0 top-0 h-1 overflow-hidden bg-primary/15">
              <div className="h-full w-2/3 origin-left animate-[indeterminate_1.25s_ease-in-out_infinite] bg-primary" />
            </div>
          ) : null}
          <form className="grid gap-5" onSubmit={onSubmit}>
            <Input
              label="FemaleDaily product URL"
              placeholder="https://reviews.femaledaily.com/products/..."
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              helper="Hanya URL publik FemaleDaily yang diproses. Scraping tetap dijalankan di backend."
              error={error}
              disabled={isProcessing}
            />
            <label className="grid gap-2 text-sm font-medium text-ink">
              Target reviews
              <input
                type="number"
                min={10}
                max={250}
                step={10}
                value={maxReviews}
                onChange={(event) => setMaxReviews(Number(event.target.value))}
                disabled={isProcessing}
                className="h-11 rounded-md border border-line bg-white px-3 text-base text-ink transition placeholder:text-ink-subtle focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-ink-muted"
              />
              <span className="text-sm font-normal text-ink-muted">
                Minimum 10, maksimum 250. Jika review produk habis lebih dulu, scraper berhenti otomatis.
              </span>
            </label>

            {scrapeState?.exists ? (
              <div className="grid gap-3 rounded-md border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-start gap-2">
                  <SearchCheck size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-sm leading-6 text-ink">
                    Produk ini sudah pernah di-scrape
                    {scrapeState.brandName || scrapeState.productName
                      ? ` (${[scrapeState.brandName, scrapeState.productName].filter(Boolean).join(" - ")})`
                      : ""}
                    . Tersimpan <strong>{scrapeState.storedReviews}</strong> review. Pilih cara melanjutkan:
                  </p>
                </div>

                <div className="grid gap-2">
                  <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-white p-3 transition hover:bg-primary/5">
                    <input
                      type="radio"
                      name="scrape-mode"
                      value="refresh"
                      checked={mode === "refresh"}
                      onChange={() => setMode("refresh")}
                      disabled={isProcessing}
                      className="mt-1 h-4 w-4 accent-primary"
                    />
                    <span className="text-sm leading-6">
                      <span className="font-semibold text-ink">Refresh</span> — ambil review terbaru dari
                      halaman awal. Review yang sudah ada tidak diduplikasi.
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-white p-3 transition hover:bg-primary/5">
                    <input
                      type="radio"
                      name="scrape-mode"
                      value="continue"
                      checked={mode === "continue"}
                      onChange={() => setMode("continue")}
                      disabled={isProcessing}
                      className="mt-1 h-4 w-4 accent-primary"
                    />
                    <span className="text-sm leading-6">
                      <span className="font-semibold text-ink">Lanjutkan</span> — gali review lebih lama,
                      melanjutkan dari sekitar review ke-{scrapeState.storedReviews + 1}.
                    </span>
                  </label>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={status === "running" || status === "validating"}
              >
                <Play size={17} aria-hidden="true" />
                Start Scraping
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => {
                  setUrl("");
                  setScrapeState(null);
                  setMode("refresh");
                }}
              >
                Clear
              </Button>
            </div>
          </form>
        </Card>

        <Card className="min-h-[280px]">
          <div className="flex h-full flex-col justify-between gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
              <h2 className="font-semibold text-ink">Status job saat ini</h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{message}</p>
              {activeJob ? (
                <div className="mt-4 rounded-md border border-line bg-slate-50 p-3">
                  <p
                    className="line-clamp-2 break-all text-sm font-semibold leading-5 text-ink"
                    title={activeJob.source_url}
                  >
                    {activeJob.source_url}
                  </p>
                  <div className="mt-2 h-2 rounded-full bg-white">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          ((activeJob.total_reviews || 0) /
                            Math.max(activeJob.requested_reviews ?? maxReviews, 1)) *
                            100,
                          100
                        )}%`
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-medium text-ink-muted">
                    {activeJob.total_reviews} / {activeJob.requested_reviews ?? maxReviews} review
                    {activeJob.stop_reason ? ` · ${formatStopReason(activeJob.stop_reason)}` : ""}
                  </p>
                </div>
              ) : null}
              </div>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/15">
                {status === "running" || status === "validating" ? (
                  <RotateCw className="animate-spin" size={21} aria-hidden="true" />
                ) : (
                  <SearchCheck size={21} aria-hidden="true" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge status={status === "idle" || status === "validating" ? "pending" : status}>
                {status === "idle"
                  ? "Siap"
                  : status === "validating"
                    ? "Memvalidasi"
                    : formatJobStatus(status)}
              </Badge>
              {status === "success" ? <CheckCircle2 className="text-emerald-600" size={18} /> : null}
              {status === "failed" ? <AlertCircle className="text-danger" size={18} /> : null}
            </div>
          </div>
        </Card>
      </div>

      {logs.length > 0 || isProcessing ? (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-ink">Live scraper log</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Output proses scraping langsung dari backend, realtime.
              </p>
            </div>
          </div>
          <ScrapeTerminal entries={logs} running={isProcessing} />
        </section>
      ) : null}

      <section className="mt-6">
        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
            <div>
              <h2 className="font-semibold text-ink">Riwayat scrape</h2>
              <p className="mt-1 text-sm text-ink-muted">Menampilkan maksimal 10 job terbaru.</p>
            </div>
            <Button type="button" variant="secondary" onClick={() => void loadJobs()} disabled={jobsLoading}>
              Refresh
            </Button>
          </div>

          {jobsLoading ? (
            <div className="grid gap-3 p-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14" />
              ))}
            </div>
          ) : jobsError ? (
            <div className="p-5">
              <EmptyState title="Riwayat gagal dimuat" description={jobsError} />
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Belum ada riwayat scrape"
                description="Mulai scraping pertama untuk melihat status dan hasil job di sini."
              />
            </div>
          ) : (
            <div className="divide-y divide-line">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="grid min-w-0 gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{job.source_url}</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {formatDate(job.started_at)} · {job.total_reviews} / {job.requested_reviews ?? 10} review
                      {job.stop_reason ? ` · ${formatStopReason(job.stop_reason)}` : ""}
                    </p>
                  </div>
                  <Badge status={job.status}>{formatJobStatus(job.status)}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </>
  );
}
