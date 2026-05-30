"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Database,
  FileUp,
  Globe,
  PenLine,
  Rocket,
  Search
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { ScrapeTerminal } from "@/components/scrape-terminal";
import { getProducts } from "@/lib/api";
import { startAnalysis, streamAnalysisProgress } from "@/lib/sentiment-api";
import type { Product } from "@/lib/types";
import type { AnalysisLogEntry, AnalysisType, SourceType } from "@/lib/sentiment-types";

type Step = "source" | "config" | "processing";

const sourceOptions: Array<{ id: SourceType; label: string; description: string; icon: typeof Database }> = [
  {
    id: "scraping",
    label: "Dari Hasil Scraping",
    description: "Analisis review yang sudah di-scrape dari FemaleDaily.",
    icon: Database
  },
  {
    id: "upload",
    label: "Upload File (CSV/Excel)",
    description: "Upload dataset sendiri untuk dianalisis.",
    icon: FileUp
  },
  {
    id: "manual",
    label: "Input Manual",
    description: "Ketik atau paste teks langsung untuk analisis cepat.",
    icon: PenLine
  },
  {
    id: "url",
    label: "Dari URL",
    description: "Scrape teks dari URL lalu analisis otomatis.",
    icon: Globe
  }
];

const analysisTypeOptions: Array<{ id: AnalysisType; label: string; description: string }> = [
  { id: "sentiment", label: "Sentiment Polarity", description: "Positif / Negatif / Netral" },
  { id: "emotion", label: "Emotion Detection", description: "Joy, Anger, Sadness, Fear, dll" },
  { id: "aspect", label: "Aspect-Based", description: "Sentiment per aspek (harga, kualitas, dll)" },
  { id: "keyword", label: "Keyword Extraction", description: "Kata kunci paling sering muncul" },
  { id: "topic", label: "Topic Modeling", description: "Grupkan teks ke topik otomatis" }
];

export default function NewAnalysisPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("source");

  // Source
  const [sourceType, setSourceType] = useState<SourceType>("scraping");
  const [manualTexts, setManualTexts] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  // Scraping source filters
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Config
  const [title, setTitle] = useState("");
  const [model, setModel] = useState("indobert");
  const [analysisTypes, setAnalysisTypes] = useState<AnalysisType[]>(["sentiment", "emotion"]);
  const [topicCount, setTopicCount] = useState(5);

  // Processing
  const [logs, setLogs] = useState<AnalysisLogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisId, setAnalysisId] = useState("");

  // Load products when scraping source is selected.
  useEffect(() => {
    if (sourceType !== "scraping") return;
    let active = true;
    setProductsLoading(true);
    setProductsError("");
    getProducts()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((err) => {
        if (active) setProductsError(err instanceof Error ? err.message : "Gagal memuat produk");
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sourceType]);

  const filteredProducts = products.filter((p) => {
    const term = productSearch.toLowerCase();
    if (!term) return true;
    return [p.product_name, p.brand_name, p.category ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });

  const selectedReviewCount = products
    .filter((p) => selectedProductIds.includes(p.id))
    .reduce((sum, p) => sum + (p.total_reviews || 0), 0);

  function toggleProduct(id: string) {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function selectAllFiltered() {
    setSelectedProductIds(filteredProducts.map((p) => p.id));
  }

  function clearProductSelection() {
    setSelectedProductIds([]);
  }

  function toggleAnalysisType(type: AnalysisType) {
    setAnalysisTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function buildSourceConfig() {
    switch (sourceType) {
      case "manual":
        return {
          texts: manualTexts
            .split("\n")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        };
      case "url":
        return { url: sourceUrl };
      case "scraping":
        return {
          // Empty product_ids = analyze ALL reviews owned by the user.
          product_ids: selectedProductIds,
          rating_filter: ratingFilter || null,
          date_from: dateFrom || null,
          date_to: dateTo || null
        };
      case "upload":
        return { dataset_id: "" }; // Will be enhanced with upload flow
      default:
        return {};
    }
  }

  async function handleStartAnalysis() {
    setStep("processing");
    setIsProcessing(true);
    setLogs([
      {
        ts: new Date().toISOString(),
        level: "info",
        message: "Mengirim permintaan analisis ke server..."
      }
    ]);

    try {
      const result = await startAnalysis({
        title: title || `Analisis ${new Date().toLocaleDateString("id-ID")}`,
        source_type: sourceType,
        source_config: buildSourceConfig(),
        model,
        analysis_types: analysisTypes,
        topic_count: topicCount
      });

      setAnalysisId(result.analysis_id);
      setLogs((prev) => [
        ...prev,
        {
          ts: new Date().toISOString(),
          level: "success",
          message: `Job berhasil dibuat (ID: ${result.analysis_id}). Memulai streaming progress...`
        }
      ]);

      // Start streaming
      streamAnalysisProgress(result.analysis_id, {
        onEntry: (entry) => setLogs((prev) => [...prev, entry]),
        onDone: () => {
          setIsProcessing(false);
          setLogs((prev) => [
            ...prev,
            {
              ts: new Date().toISOString(),
              level: "success",
              message: "Analisis selesai! Mengarahkan ke hasil..."
            }
          ]);
          setTimeout(() => {
            router.push(`/sentiment/results/${result.analysis_id}`);
          }, 1500);
        },
        onError: (error) => {
          setIsProcessing(false);
          setLogs((prev) => [
            ...prev,
            {
              ts: new Date().toISOString(),
              level: "error",
              message: `Error: ${error.message}`
            }
          ]);
        }
      });
    } catch (err) {
      setIsProcessing(false);
      setLogs((prev) => [
        ...prev,
        {
          ts: new Date().toISOString(),
          level: "error",
          message: err instanceof Error ? err.message : "Gagal memulai analisis"
        }
      ]);
    }
  }

  return (
    <>
      <PageHeader
        title="Analisis Baru"
        description="Buat analisis sentimen baru dengan memilih sumber data, model, dan jenis analisis."
      />

      {/* Step Indicator */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <span
          className={`rounded-full px-3 py-1 font-medium ${step === "source" ? "bg-primary/20 text-ink" : "bg-slate-100 text-ink-muted"}`}
        >
          1. Sumber Data
        </span>
        <ArrowRight size={14} className="text-ink-muted" aria-hidden="true" />
        <span
          className={`rounded-full px-3 py-1 font-medium ${step === "config" ? "bg-primary/20 text-ink" : "bg-slate-100 text-ink-muted"}`}
        >
          2. Konfigurasi
        </span>
        <ArrowRight size={14} className="text-ink-muted" aria-hidden="true" />
        <span
          className={`rounded-full px-3 py-1 font-medium ${step === "processing" ? "bg-primary/20 text-ink" : "bg-slate-100 text-ink-muted"}`}
        >
          3. Proses
        </span>
      </div>

      {/* Step 1: Source Selection */}
      {step === "source" && (
        <div className="grid gap-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {sourceOptions.map((option) => {
              const Icon = option.icon;
              const selected = sourceType === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSourceType(option.id)}
                  className={`grid gap-3 rounded-lg border-2 p-5 text-left transition ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-line bg-white hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15">
                      <Icon size={20} aria-hidden="true" />
                    </div>
                    <span className="font-semibold text-ink">{option.label}</span>
                  </div>
                  <p className="text-sm text-ink-muted">{option.description}</p>
                </button>
              );
            })}
          </div>

          {/* Source-specific inputs */}
          {sourceType === "manual" && (
            <Card>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-ink">
                  Masukkan teks (satu per baris)
                </span>
                <textarea
                  value={manualTexts}
                  onChange={(e) => setManualTexts(e.target.value)}
                  placeholder={"Produknya bagus banget, recommended!\nPengiriman lama, packaging rusak\nHarga sesuai kualitas sih"}
                  rows={6}
                  className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline focus:outline-2 focus:outline-primary"
                />
                <span className="text-xs text-ink-muted">
                  {manualTexts.split("\n").filter((t) => t.trim().length > 0).length} teks terdeteksi
                </span>
              </label>
            </Card>
          )}

          {sourceType === "url" && (
            <Card>
              <Input
                label="URL sumber"
                placeholder="https://example.com/article-review"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                helper="Teks akan di-scrape dari URL ini lalu dianalisis."
              />
            </Card>
          )}

          {sourceType === "scraping" && (
            <Card className="grid gap-5">
              <div>
                <h3 className="font-semibold text-ink">Pilih Produk untuk Dianalisis</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  Pilih satu atau beberapa produk hasil scraping. Kosongkan pilihan untuk
                  menganalisis <strong>semua review</strong> yang kamu punya.
                </p>
              </div>

              {/* Search + bulk actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cari produk atau brand..."
                    className="h-10 w-full rounded-md border border-line bg-white pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:outline focus:outline-2 focus:outline-primary"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={selectAllFiltered}
                  disabled={productsLoading || filteredProducts.length === 0}
                >
                  Pilih Semua
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={clearProductSelection}
                  disabled={selectedProductIds.length === 0}
                >
                  Hapus Pilihan
                </Button>
              </div>

              {/* Product list */}
              {productsLoading ? (
                <div className="grid gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : productsError ? (
                <EmptyState title="Gagal memuat produk" description={productsError} />
              ) : products.length === 0 ? (
                <EmptyState
                  title="Belum ada produk"
                  description="Kamu belum punya produk hasil scraping. Lakukan scraping dulu di menu Scraper."
                />
              ) : filteredProducts.length === 0 ? (
                <EmptyState
                  title="Tidak ada hasil"
                  description={`Tidak ada produk yang cocok dengan "${productSearch}".`}
                />
              ) : (
                <div className="grid max-h-80 gap-2 overflow-y-auto pr-1">
                  {filteredProducts.map((product) => {
                    const selected = selectedProductIds.includes(product.id);
                    return (
                      <label
                        key={product.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                          selected ? "border-primary bg-primary/5" : "border-line hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleProduct(product.id)}
                          className="mt-0.5 h-4 w-4 accent-primary"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink">
                            {product.product_name}
                          </span>
                          <span className="block truncate text-xs text-ink-muted">
                            {product.brand_name}
                            {product.category ? ` · ${product.category}` : ""} ·{" "}
                            {product.total_reviews} review
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Optional filters */}
              <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-ink">Filter Rating</span>
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline focus:outline-2 focus:outline-primary"
                  >
                    <option value="">Semua rating</option>
                    <option value="5">5 bintang</option>
                    <option value="4">4 bintang</option>
                    <option value="3">3 bintang</option>
                    <option value="2">2 bintang</option>
                    <option value="1">1 bintang</option>
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-ink">Dari Tanggal</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline focus:outline-2 focus:outline-primary"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-ink">Sampai Tanggal</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline focus:outline-2 focus:outline-primary"
                  />
                </label>
              </div>

              {/* Selection summary */}
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm text-ink">
                {selectedProductIds.length === 0 ? (
                  <span>
                    Belum ada produk dipilih → akan menganalisis <strong>semua review</strong>.
                  </span>
                ) : (
                  <span>
                    <strong>{selectedProductIds.length}</strong> produk dipilih ·{" "}
                    <strong>{selectedReviewCount}</strong> review akan dianalisis
                    {ratingFilter ? ` · rating ${ratingFilter}★` : ""}.
                  </span>
                )}
              </div>
            </Card>
          )}

          {sourceType === "upload" && (
            <Card>
              <div className="grid place-items-center gap-3 rounded-lg border-2 border-dashed border-line p-8 text-center">
                <FileUp size={32} className="text-ink-muted" aria-hidden="true" />
                <p className="text-sm font-medium text-ink">
                  Drag & drop file CSV atau Excel di sini
                </p>
                <p className="text-xs text-ink-muted">Maksimum 5000 baris, 10MB</p>
                <Button variant="secondary" type="button">
                  Pilih File
                </Button>
              </div>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setStep("config")}>
              Lanjut
              <ArrowRight size={17} aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Configuration */}
      {step === "config" && (
        <div className="grid gap-6">
          <Card>
            <div className="grid gap-5">
              <Input
                label="Judul Analisis"
                placeholder="Analisis Review Skincare Mei 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                helper="Opsional. Jika kosong, akan di-generate otomatis."
              />

              <label className="grid gap-2">
                <span className="text-sm font-medium text-ink">Model Analisis</span>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="h-11 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline focus:outline-2 focus:outline-primary"
                >
                  <option value="indobert">IndoBERT (Lokal — Gratis)</option>
                  <option value="openai-gpt4o-mini">OpenAI GPT-4o Mini (API Key)</option>
                  <option value="openai-gpt4o">OpenAI GPT-4o (API Key)</option>
                  <option value="google-nlp">Google Cloud NLP (API Key)</option>
                </select>
                <span className="text-xs text-ink-muted">
                  {model === "indobert"
                    ? "Model lokal untuk Bahasa Indonesia. Gratis, tidak butuh API key."
                    : "Butuh API key. Pastikan sudah di-set di Pengaturan."}
                </span>
              </label>

              <fieldset className="grid gap-3">
                <legend className="text-sm font-medium text-ink">Jenis Analisis</legend>
                {analysisTypeOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-start gap-3 rounded-md border border-line p-3 transition hover:bg-primary/5"
                  >
                    <input
                      type="checkbox"
                      checked={analysisTypes.includes(option.id)}
                      onChange={() => toggleAnalysisType(option.id)}
                      disabled={option.id === "sentiment"}
                      className="mt-0.5 h-4 w-4 accent-primary"
                    />
                    <span className="text-sm leading-5">
                      <span className="font-semibold text-ink">{option.label}</span>
                      <br />
                      <span className="text-ink-muted">{option.description}</span>
                    </span>
                  </label>
                ))}
              </fieldset>

              {analysisTypes.includes("topic") && (
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-ink">Jumlah Topik</span>
                  <input
                    type="number"
                    min={3}
                    max={10}
                    value={topicCount}
                    onChange={(e) => setTopicCount(Number(e.target.value))}
                    className="h-11 w-24 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline focus:outline-2 focus:outline-primary"
                  />
                  <span className="text-xs text-ink-muted">Antara 3-10 topik.</span>
                </label>
              )}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep("source")}>
              <ArrowLeft size={17} aria-hidden="true" />
              Kembali
            </Button>
            <Button onClick={handleStartAnalysis}>
              <Rocket size={17} aria-hidden="true" />
              Mulai Analisis
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Processing */}
      {step === "processing" && (
        <div className="grid gap-6">
          <ScrapeTerminal
            entries={logs.map((l) => ({ ts: l.ts, level: l.level, message: l.message }))}
            running={isProcessing}
          />

          {isProcessing && (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                onClick={() => {
                  if (analysisId) {
                    import("@/lib/sentiment-api").then(({ cancelAnalysis }) =>
                      cancelAnalysis(analysisId)
                    );
                  }
                  setIsProcessing(false);
                  setLogs((prev) => [
                    ...prev,
                    { ts: new Date().toISOString(), level: "warn", message: "Analisis dibatalkan oleh user." }
                  ]);
                }}
              >
                Batalkan Analisis
              </Button>
            </div>
          )}

          {!isProcessing && logs.some((l) => l.level === "error") && (
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setStep("config")}>
                <ArrowLeft size={17} aria-hidden="true" />
                Kembali ke Konfigurasi
              </Button>
              <Button onClick={handleStartAnalysis}>
                Coba Lagi
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
