"use client";

import { useEffect, useState } from "react";
import { Download, FileJson, Settings2, Table } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getProducts, getReviews } from "@/lib/api";
import type { Product, Review } from "@/lib/types";

const fieldOptions = [
  { key: "product_name", label: "Product name" },
  { key: "brand_name", label: "Brand" },
  { key: "category", label: "Category" },
  { key: "rating", label: "Rating" },
  { key: "review_date", label: "Review date" },
  { key: "review_text", label: "Review text" },
  { key: "source_url", label: "Source URL" },
  { key: "scraped_at", label: "Scraped at" }
] satisfies { key: keyof Review; label: string }[];

const limitOptions = [100, 500, 1000, 5000, 10000];
const ratingOptions = ["1", "2", "3", "4", "5"];

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ExportPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [rating, setRating] = useState("");
  const [limit, setLimit] = useState(10000);
  const [selectedFields, setSelectedFields] = useState<(keyof Review)[]>(
    fieldOptions.map((field) => field.key)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    const timer = window.setTimeout(() => {
      getReviews({
        search,
        productId,
        rating,
        limit
      })
        .then((data) => {
          if (!active) return;
          setReviews(data);
          setError("");
        })
        .catch((requestError) => {
          if (!active) return;
          setReviews([]);
          setError(requestError instanceof Error ? requestError.message : "Failed to load export data");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [limit, productId, rating, search]);

  function getExportRows() {
    return reviews.map((review) =>
      Object.fromEntries(selectedFields.map((field) => [field, review[field] ?? ""]))
    );
  }

  function exportJson() {
    downloadFile(
      "femaledaily-reviews.json",
      JSON.stringify(getExportRows(), null, 2),
      "application/json"
    );
  }

  function exportCsv() {
    const headers = selectedFields.map(
      (field) => fieldOptions.find((option) => option.key === field)?.label ?? field
    );
    const rows = reviews.map((review) =>
      selectedFields
        .map((field) => {
          const value = String(review[field] ?? "");
          return `"${value.replaceAll('"', '""')}"`;
        })
        .join(",")
    );
    downloadFile("femaledaily-reviews.csv", [headers.join(","), ...rows].join("\n"), "text/csv");
  }

  function toggleField(field: keyof Review) {
    setSelectedFields((currentFields) =>
      currentFields.includes(field)
        ? currentFields.filter((currentField) => currentField !== field)
        : [...currentFields, field]
    );
  }

  const exportDisabled = loading || !!error || selectedFields.length === 0;

  return (
    <>
      <PageHeader
        title="Export"
        description="Atur filter dan kolom dataset review sebelum export ke CSV atau JSON."
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15">
              <Settings2 size={19} aria-hidden="true" />
            </div>
            <h2 className="font-semibold text-ink">Export settings</h2>
          </div>

          <div className="mt-5 grid gap-4">
            <Input
              label="Search"
              placeholder="Cari isi review atau nama produk"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <label className="grid gap-2 text-sm font-medium text-ink">
              Product
              <select
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                className="h-11 rounded-md border border-line bg-white px-3 text-base text-ink transition focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              >
                <option value="">All products</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.brand_name} - {product.product_name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-ink">
                Rating
                <select
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                  className="h-11 rounded-md border border-line bg-white px-3 text-base text-ink transition focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary"
                >
                  <option value="">All ratings</option>
                  {ratingOptions.map((option) => (
                    <option key={option} value={option}>
                      {option} star
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-ink">
                Row limit
                <select
                  value={limit}
                  onChange={(event) => setLimit(Number(event.target.value))}
                  className="h-11 rounded-md border border-line bg-white px-3 text-base text-ink transition focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary"
                >
                  {limitOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.toLocaleString("id-ID")} rows
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </Card>

        {error ? (
          <Card className="border-danger/30 bg-red-50 text-sm font-medium text-danger lg:col-span-2">
            {error}
          </Card>
        ) : null}

        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15">
              <Table size={19} aria-hidden="true" />
            </div>
            <h2 className="font-semibold text-ink">Export field preview</h2>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {fieldOptions.map((field) => (
              <label
                key={field.key}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-line bg-slate-50 px-3 py-2 text-sm font-semibold transition hover:bg-primary/10"
              >
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field.key)}
                  onChange={() => toggleField(field.key)}
                  className="h-4 w-4 accent-primary"
                />
                <span>{field.label}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-ink-muted">Dataset</dt>
                <dd className="mt-1 text-lg font-bold">Reviews</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">Rows ready</dt>
                <dd className="mt-1 text-lg font-bold">{loading ? "..." : reviews.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">Fields selected</dt>
                <dd className="mt-1 text-lg font-bold">
                  {selectedFields.length} / {fieldOptions.length}
                </dd>
              </div>
            </dl>

            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <Button onClick={exportCsv} className="w-full sm:w-auto" disabled={exportDisabled}>
                <Download size={17} aria-hidden="true" />
                Export CSV
              </Button>
              <Button
                variant="secondary"
                onClick={exportJson}
                className="w-full sm:w-auto"
                disabled={exportDisabled}
              >
                <FileJson size={17} aria-hidden="true" />
                Export JSON
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}
