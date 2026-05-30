"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, RotateCw, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { deleteAnalysis, getAnalyses } from "@/lib/sentiment-api";
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

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<SentimentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  function loadData() {
    setLoading(true);
    setError("");
    const params: { limit: number; status?: string } = { limit: 50 };
    if (statusFilter !== "all") params.status = statusFilter;

    getAnalyses(params)
      .then((res) => setAnalyses(res.results))
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat data"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  async function handleDelete(id: string) {
    if (!confirm("Hapus analisis ini beserta semua hasilnya?")) return;
    try {
      await deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  return (
    <>
      <PageHeader
        title="Riwayat Analisis"
        description="Semua analisis sentimen yang pernah dijalankan."
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline focus:outline-2 focus:outline-primary"
        >
          <option value="all">Semua Status</option>
          <option value="completed">Selesai</option>
          <option value="processing">Proses</option>
          <option value="failed">Gagal</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
        <Button variant="secondary" onClick={loadData} disabled={loading}>
          <RotateCw size={15} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {/* List */}
      <Card className="p-0">
        {loading ? (
          <div className="grid gap-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : error ? (
          <div className="p-5">
            <EmptyState title="Gagal memuat" description={error} />
          </div>
        ) : analyses.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Tidak ada analisis"
              description={
                statusFilter === "all"
                  ? "Belum ada analisis. Mulai analisis baru dari menu Analisis Baru."
                  : "Tidak ada analisis dengan status ini."
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-ink">{analysis.title}</p>
                    <Badge status={statusToBadge(analysis.status)}>
                      {formatStatus(analysis.status)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">
                    {analysis.model_used} · {analysis.total_texts} teks ·{" "}
                    {analysis.source_type === "scraping"
                      ? "Dari scraping"
                      : analysis.source_type === "upload"
                        ? "Upload file"
                        : analysis.source_type === "manual"
                          ? "Input manual"
                          : "Dari URL"}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                    <Clock size={12} aria-hidden="true" />
                    {new Date(analysis.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                    {analysis.summary?.processing_time_seconds &&
                      ` · ${analysis.summary.processing_time_seconds.toFixed(1)}s`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {analysis.status === "completed" && (
                    <Link href={`/sentiment/results/${analysis.id}`}>
                      <Button variant="secondary">Lihat Hasil</Button>
                    </Link>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => handleDelete(analysis.id)}
                    title="Hapus analisis"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
