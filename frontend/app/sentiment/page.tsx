"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Brain, Clock, PlusCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { getAnalyses } from "@/lib/sentiment-api";
import type { SentimentAnalysis } from "@/lib/sentiment-types";

function formatStatus(status: string) {
  const map: Record<string, string> = {
    queued: "Antrian",
    loading: "Memuat",
    processing: "Proses",
    completed: "Selesai",
    failed: "Gagal",
    cancelled: "Dibatalkan"
  };
  return map[status] ?? status;
}

function statusToBadge(status: string): "pending" | "running" | "success" | "failed" {
  if (status === "completed") return "success";
  if (status === "failed" || status === "cancelled") return "failed";
  if (status === "processing" || status === "loading") return "running";
  return "pending";
}

export default function SentimentOverviewPage() {
  const [analyses, setAnalyses] = useState<SentimentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getAnalyses({ limit: 5 })
      .then((res) => setAnalyses(res.results))
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat data"))
      .finally(() => setLoading(false));
  }, []);

  const totalAnalyses = analyses.length;
  const completedAnalyses = analyses.filter((a) => a.status === "completed");
  const avgPositive =
    completedAnalyses.length > 0
      ? Math.round(
          completedAnalyses.reduce(
            (sum, a) => sum + (a.summary?.sentiment_percentage?.positive ?? 0),
            0
          ) / completedAnalyses.length
        )
      : 0;

  return (
    <>
      <PageHeader
        title="Sentiment Analysis"
        description="Overview analisis sentimen. Mulai analisis baru atau lihat hasil sebelumnya."
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/15">
            <BarChart3 size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-ink-muted">Total Analisis</p>
            <p className="text-xl font-bold text-ink">
              {loading ? <Skeleton className="h-6 w-10" /> : totalAnalyses}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-100">
            <TrendingUp size={20} className="text-emerald-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-ink-muted">Rata-rata Positif</p>
            <p className="text-xl font-bold text-ink">
              {loading ? <Skeleton className="h-6 w-10" /> : `${avgPositive}%`}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-100">
            <Brain size={20} className="text-blue-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-ink-muted">Model Favorit</p>
            <p className="text-xl font-bold text-ink">
              {loading ? <Skeleton className="h-6 w-16" /> : "IndoBERT"}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-amber-100">
            <Clock size={20} className="text-amber-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-ink-muted">Terakhir</p>
            <p className="text-sm font-bold text-ink">
              {loading ? (
                <Skeleton className="h-5 w-20" />
              ) : completedAnalyses[0]?.completed_at ? (
                new Date(completedAnalyses[0].completed_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })
              ) : (
                "—"
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/sentiment/new">
          <Button>
            <PlusCircle size={17} aria-hidden="true" />
            Analisis Baru
          </Button>
        </Link>
        <Link href="/sentiment/history">
          <Button variant="secondary">Lihat Semua Riwayat</Button>
        </Link>
      </div>

      {/* Recent Analyses */}
      <section className="mt-8">
        <Card className="p-0">
          <div className="border-b border-line p-5">
            <h2 className="font-semibold text-ink">Analisis Terbaru</h2>
            <p className="mt-1 text-sm text-ink-muted">5 analisis terakhir yang dijalankan.</p>
          </div>

          {loading ? (
            <div className="grid gap-3 p-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : error ? (
            <div className="p-5">
              <EmptyState title="Gagal memuat" description={error} />
            </div>
          ) : analyses.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Belum ada analisis"
                description="Mulai analisis pertama untuk melihat hasilnya di sini."
              />
            </div>
          ) : (
            <div className="divide-y divide-line">
              {analyses.map((analysis) => (
                <Link
                  key={analysis.id}
                  href={
                    analysis.status === "completed"
                      ? `/sentiment/results/${analysis.id}`
                      : `/sentiment/history`
                  }
                  className="grid min-w-0 gap-2 p-5 transition hover:bg-slate-50 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{analysis.title}</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {analysis.model_used} · {analysis.total_texts} teks ·{" "}
                      {new Date(analysis.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short"
                      })}
                      {analysis.summary?.sentiment_percentage?.positive != null &&
                        ` · ${Math.round(analysis.summary.sentiment_percentage.positive)}% positif`}
                    </p>
                  </div>
                  <Badge status={statusToBadge(analysis.status)}>
                    {formatStatus(analysis.status)}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </section>
    </>
  );
}
