"use client";

import { useEffect, useState } from "react";
import { GitCompare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { getAnalyses, getAnalysis } from "@/lib/sentiment-api";
import type { SentimentAnalysis } from "@/lib/sentiment-types";

export default function ComparePage() {
  const [analyses, setAnalyses] = useState<SentimentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedA, setSelectedA] = useState("");
  const [selectedB, setSelectedB] = useState("");
  const [analysisA, setAnalysisA] = useState<SentimentAnalysis | null>(null);
  const [analysisB, setAnalysisB] = useState<SentimentAnalysis | null>(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    getAnalyses({ limit: 50, status: "completed" })
      .then((res) => setAnalyses(res.results))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCompare() {
    if (!selectedA || !selectedB) return;
    setComparing(true);
    try {
      const [a, b] = await Promise.all([getAnalysis(selectedA), getAnalysis(selectedB)]);
      setAnalysisA(a);
      setAnalysisB(b);
    } catch {
      alert("Gagal memuat data perbandingan");
    } finally {
      setComparing(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Bandingkan Analisis"
        description="Bandingkan dua analisis sentimen secara side-by-side."
      />

      {/* Selection */}
      <Card>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-ink">Analisis A</span>
            {loading ? (
              <Skeleton className="h-11" />
            ) : (
              <select
                value={selectedA}
                onChange={(e) => setSelectedA(e.target.value)}
                className="h-11 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline focus:outline-2 focus:outline-primary"
              >
                <option value="">Pilih analisis...</option>
                {analyses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.total_texts} teks)
                  </option>
                ))}
              </select>
            )}
          </label>

          <div className="flex items-end justify-center pb-1">
            <GitCompare size={20} className="text-ink-muted" aria-hidden="true" />
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-ink">Analisis B</span>
            {loading ? (
              <Skeleton className="h-11" />
            ) : (
              <select
                value={selectedB}
                onChange={(e) => setSelectedB(e.target.value)}
                className="h-11 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline focus:outline-2 focus:outline-primary"
              >
                <option value="">Pilih analisis...</option>
                {analyses
                  .filter((a) => a.id !== selectedA)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.total_texts} teks)
                    </option>
                  ))}
              </select>
            )}
          </label>
        </div>

        <div className="mt-4 flex justify-center">
          <Button onClick={handleCompare} disabled={!selectedA || !selectedB || comparing}>
            {comparing ? "Memuat..." : "Bandingkan"}
          </Button>
        </div>
      </Card>

      {/* Comparison Results */}
      {analysisA && analysisB && (
        <div className="mt-6 grid gap-6">
          {/* Side by side summary */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="mb-3 font-semibold text-ink">{analysisA.title}</h3>
              <div className="grid gap-2 text-sm">
                <p className="text-ink-muted">
                  Model: <span className="font-medium text-ink">{analysisA.model_used}</span>
                </p>
                <p className="text-ink-muted">
                  Total teks: <span className="font-medium text-ink">{analysisA.total_texts}</span>
                </p>
                {analysisA.summary && (
                  <>
                    <div className="mt-2 grid gap-1">
                      <div className="flex justify-between">
                        <span className="text-emerald-600">Positif</span>
                        <span className="font-bold text-emerald-600">
                          {Math.round(analysisA.summary.sentiment_percentage.positive)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">Negatif</span>
                        <span className="font-bold text-red-600">
                          {Math.round(analysisA.summary.sentiment_percentage.negative)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Netral</span>
                        <span className="font-bold text-slate-600">
                          {Math.round(analysisA.summary.sentiment_percentage.neutral)}%
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-ink-muted">
                      Emosi dominan: {analysisA.summary.dominant_emotion}
                    </p>
                  </>
                )}
              </div>
            </Card>

            <Card>
              <h3 className="mb-3 font-semibold text-ink">{analysisB.title}</h3>
              <div className="grid gap-2 text-sm">
                <p className="text-ink-muted">
                  Model: <span className="font-medium text-ink">{analysisB.model_used}</span>
                </p>
                <p className="text-ink-muted">
                  Total teks: <span className="font-medium text-ink">{analysisB.total_texts}</span>
                </p>
                {analysisB.summary && (
                  <>
                    <div className="mt-2 grid gap-1">
                      <div className="flex justify-between">
                        <span className="text-emerald-600">Positif</span>
                        <span className="font-bold text-emerald-600">
                          {Math.round(analysisB.summary.sentiment_percentage.positive)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">Negatif</span>
                        <span className="font-bold text-red-600">
                          {Math.round(analysisB.summary.sentiment_percentage.negative)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Netral</span>
                        <span className="font-bold text-slate-600">
                          {Math.round(analysisB.summary.sentiment_percentage.neutral)}%
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-ink-muted">
                      Emosi dominan: {analysisB.summary.dominant_emotion}
                    </p>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Difference */}
          {analysisA.summary && analysisB.summary && (
            <Card className="border-primary/30 bg-primary/5">
              <h3 className="mb-3 font-semibold text-ink">Perbedaan</h3>
              <div className="grid gap-2 text-sm">
                <p className="text-ink-muted">
                  Selisih Positif:{" "}
                  <span className="font-bold text-ink">
                    {(
                      analysisA.summary.sentiment_percentage.positive -
                      analysisB.summary.sentiment_percentage.positive
                    ).toFixed(1)}
                    %
                  </span>
                </p>
                <p className="text-ink-muted">
                  Selisih Negatif:{" "}
                  <span className="font-bold text-ink">
                    {(
                      analysisA.summary.sentiment_percentage.negative -
                      analysisB.summary.sentiment_percentage.negative
                    ).toFixed(1)}
                    %
                  </span>
                </p>
                <p className="mt-2 text-ink-muted">
                  {analysisA.summary.sentiment_percentage.positive >
                  analysisB.summary.sentiment_percentage.positive
                    ? `"${analysisA.title}" memiliki sentimen lebih positif.`
                    : `"${analysisB.title}" memiliki sentimen lebih positif.`}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {!analysisA && !analysisB && !loading && analyses.length < 2 && (
        <div className="mt-6">
          <EmptyState
            title="Minimal 2 analisis"
            description="Anda butuh minimal 2 analisis yang sudah selesai untuk membandingkan."
          />
        </div>
      )}
    </>
  );
}
