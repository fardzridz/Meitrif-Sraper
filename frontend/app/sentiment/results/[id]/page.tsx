"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Download,
  Hash,
  List,
  MessageSquare,
  Sparkles,
  Target
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAnalysis, getAnalysisResults, exportAnalysisCsv } from "@/lib/sentiment-api";
import type { SentimentAnalysis, SentimentResult } from "@/lib/sentiment-types";

type Tab = "sentiment" | "emotions" | "aspects" | "keywords" | "topics" | "detail";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [analysis, setAnalysis] = useState<SentimentAnalysis | null>(null);
  const [results, setResults] = useState<SentimentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("sentiment");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getAnalysis(id), getAnalysisResults(id, { limit: 50 })])
      .then(([analysisData, resultsData]) => {
        setAnalysis(analysisData);
        setResults(resultsData.results);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleExportCsv() {
    try {
      const blob = await exportAnalysisCsv(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sentiment-${id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Export gagal");
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="grid gap-4">
        <Button variant="secondary" onClick={() => router.push("/sentiment/history")}>
          <ArrowLeft size={17} aria-hidden="true" />
          Kembali
        </Button>
        <Card>
          <p className="text-sm font-medium text-danger">{error || "Analisis tidak ditemukan"}</p>
        </Card>
      </div>
    );
  }

  const summary = analysis.summary;
  const sentimentDist = summary?.sentiment_percentage ?? { positive: 0, negative: 0, neutral: 0 };

  const tabs: Array<{ id: Tab; label: string; icon: typeof BarChart3 }> = [
    { id: "sentiment", label: "Sentiment", icon: BarChart3 },
    { id: "emotions", label: "Emosi", icon: Sparkles },
    { id: "aspects", label: "Aspek", icon: Target },
    { id: "keywords", label: "Keywords", icon: Hash },
    { id: "topics", label: "Topik", icon: MessageSquare },
    { id: "detail", label: "Detail", icon: List }
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => router.push("/sentiment/history")}>
            <ArrowLeft size={17} aria-hidden="true" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-ink">{analysis.title}</h1>
            <p className="text-sm text-ink-muted">
              {analysis.model_used} · {analysis.total_texts} teks
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={handleExportCsv}>
          <Download size={17} aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-ink">{analysis.total_texts}</p>
          <p className="mt-1 text-sm text-ink-muted">Total Teks</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-emerald-600">
            {Math.round(sentimentDist.positive)}%
          </p>
          <p className="mt-1 text-sm text-ink-muted">Positif</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-ink">{summary?.dominant_emotion ?? "—"}</p>
          <p className="mt-1 text-sm text-ink-muted">Emosi Dominan</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-ink">{analysis.model_used}</p>
          <p className="mt-1 text-sm text-ink-muted">Model</p>
        </Card>
      </div>

      {/* Auto Insight */}
      {summary?.auto_insight && (
        <Card className="mt-6 border-primary/30 bg-primary/5">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-ink">Insight Otomatis</p>
              <p className="mt-1 text-sm leading-6 text-ink-muted">{summary.auto_insight}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-line pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "border-primary text-ink"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <Icon size={15} aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "sentiment" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Sentiment Distribution Visual */}
            <Card>
              <h3 className="mb-4 font-semibold text-ink">Distribusi Sentiment</h3>
              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-16 text-sm font-medium text-ink">Positif</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-6 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${sentimentDist.positive}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-bold text-ink">
                    {Math.round(sentimentDist.positive)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 text-sm font-medium text-ink">Negatif</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-6 rounded-full bg-red-500 transition-all"
                      style={{ width: `${sentimentDist.negative}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-bold text-ink">
                    {Math.round(sentimentDist.negative)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 text-sm font-medium text-ink">Netral</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-6 rounded-full bg-slate-400 transition-all"
                      style={{ width: `${sentimentDist.neutral}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-bold text-ink">
                    {Math.round(sentimentDist.neutral)}%
                  </span>
                </div>
              </div>
            </Card>

            {/* Count */}
            <Card>
              <h3 className="mb-4 font-semibold text-ink">Jumlah per Sentiment</h3>
              <div className="grid gap-4">
                <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3">
                  <span className="text-sm font-medium text-emerald-700">Positif</span>
                  <span className="text-xl font-bold text-emerald-700">
                    {summary?.sentiment_distribution?.positive ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-red-50 p-3">
                  <span className="text-sm font-medium text-red-700">Negatif</span>
                  <span className="text-xl font-bold text-red-700">
                    {summary?.sentiment_distribution?.negative ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <span className="text-sm font-medium text-slate-700">Netral</span>
                  <span className="text-xl font-bold text-slate-700">
                    {summary?.sentiment_distribution?.neutral ?? 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "emotions" && (
          <Card>
            <h3 className="mb-4 font-semibold text-ink">Emotion Breakdown</h3>
            {summary?.emotion_distribution ? (
              <div className="grid gap-3">
                {Object.entries(summary.emotion_distribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([emotion, count]) => {
                    const total = Object.values(summary.emotion_distribution).reduce((s, v) => s + v, 0);
                    const pct = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={emotion} className="flex items-center gap-3">
                        <span className="w-20 text-sm font-medium capitalize text-ink">{emotion}</span>
                        <div className="flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-5 rounded-full bg-blue-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-sm text-ink-muted">
                          {count} ({Math.round(pct)}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Data emosi tidak tersedia untuk analisis ini.</p>
            )}
          </Card>
        )}

        {activeTab === "aspects" && (
          <Card>
            <h3 className="mb-4 font-semibold text-ink">Aspect-Based Sentiment</h3>
            {summary?.top_aspects && summary.top_aspects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="pb-3 text-left font-semibold text-ink">Aspek</th>
                      <th className="pb-3 text-center font-semibold text-emerald-600">Positif</th>
                      <th className="pb-3 text-center font-semibold text-red-600">Negatif</th>
                      <th className="pb-3 text-left font-semibold text-ink">Distribusi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {summary.top_aspects.map((aspect) => {
                      const total = aspect.positive + aspect.negative;
                      const posPct = total > 0 ? (aspect.positive / total) * 100 : 50;
                      return (
                        <tr key={aspect.aspect}>
                          <td className="py-3 font-medium capitalize text-ink">{aspect.aspect}</td>
                          <td className="py-3 text-center text-emerald-600">{aspect.positive}</td>
                          <td className="py-3 text-center text-red-600">{aspect.negative}</td>
                          <td className="py-3">
                            <div className="flex h-4 overflow-hidden rounded-full">
                              <div
                                className="bg-emerald-500"
                                style={{ width: `${posPct}%` }}
                              />
                              <div
                                className="bg-red-500"
                                style={{ width: `${100 - posPct}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Data aspek tidak tersedia untuk analisis ini.</p>
            )}
          </Card>
        )}

        {activeTab === "keywords" && (
          <Card>
            <h3 className="mb-4 font-semibold text-ink">Top Keywords</h3>
            {summary?.top_keywords && summary.top_keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {summary.top_keywords.map((keyword, i) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-line bg-slate-50 px-3 py-1.5 text-sm font-medium text-ink"
                    style={{ fontSize: `${Math.max(0.75, 1.2 - i * 0.04)}rem` }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Data keyword tidak tersedia untuk analisis ini.</p>
            )}
          </Card>
        )}

        {activeTab === "topics" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summary?.topics && summary.topics.length > 0 ? (
              summary.topics.map((topic) => (
                <Card key={topic.id}>
                  <div className="flex items-center justify-between">
                    <Badge status="pending">Topik {topic.id + 1}</Badge>
                    <span className="text-sm font-bold text-ink">{topic.count} teks</span>
                  </div>
                  <p className="mt-3 font-semibold text-ink">{topic.label}</p>
                </Card>
              ))
            ) : (
              <Card className="sm:col-span-2 lg:col-span-3">
                <p className="text-sm text-ink-muted">Data topik tidak tersedia untuk analisis ini.</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === "detail" && (
          <Card className="p-0">
            <div className="border-b border-line p-5">
              <h3 className="font-semibold text-ink">Detail per Teks</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Menampilkan {results.length} hasil analisis.
              </p>
            </div>
            {results.length === 0 ? (
              <div className="p-5">
                <p className="text-sm text-ink-muted">Tidak ada hasil.</p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {results.map((result) => (
                  <div key={result.id} className="grid gap-2 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm leading-6 text-ink">{result.original_text}</p>
                      <Badge
                        status={
                          result.sentiment_label === "positive"
                            ? "success"
                            : result.sentiment_label === "negative"
                              ? "failed"
                              : "pending"
                        }
                      >
                        {result.sentiment_label === "positive"
                          ? "Positif"
                          : result.sentiment_label === "negative"
                            ? "Negatif"
                            : "Netral"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
                      <span>Skor: {Math.round(result.sentiment_score * 100)}%</span>
                      {result.dominant_emotion && (
                        <span>· Emosi: {result.dominant_emotion}</span>
                      )}
                      {result.keywords && result.keywords.length > 0 && (
                        <span>· Keywords: {result.keywords.slice(0, 3).join(", ")}</span>
                      )}
                    </div>
                    {result.aspects && result.aspects.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {result.aspects.map((asp) => (
                          <span
                            key={asp.aspect}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              asp.sentiment === "positive"
                                ? "bg-emerald-100 text-emerald-700"
                                : asp.sentiment === "negative"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {asp.aspect}: {Math.round(asp.score * 100)}%
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
