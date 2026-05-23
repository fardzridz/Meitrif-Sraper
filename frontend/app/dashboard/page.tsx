"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Package, Star, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { RecentJobs } from "@/components/recent-jobs";
import { getDashboardSummary, getJobs, getProducts } from "@/lib/api";
import type { DashboardSummary, Product, ScrapeJob } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([getDashboardSummary(), getJobs(), getProducts()])
      .then(([summaryData, jobsData, productsData]) => {
        if (!active) return;
        setSummary(summaryData);
        setJobs(jobsData);
        setProducts(productsData);
        setError("");
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : "Dashboard failed to load");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="Ringkasan produk, review, dan aktivitas scraping terbaru untuk dataset FemaleDaily."
        />
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="h-28 animate-pulse bg-slate-50" />
          ))}
        </section>
      </>
    );
  }

  if (error || !summary) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="Ringkasan produk, review, dan aktivitas scraping terbaru untuk dataset FemaleDaily."
        />
        <EmptyState title="Dashboard gagal dimuat" description={error || "Data ringkasan tidak tersedia."} />
      </>
    );
  }

  const topProducts = products
    .filter((product) => product.total_reviews > 0)
    .sort((a, b) => b.total_reviews - a.total_reviews)
    .slice(0, 5);
  const maxReviews = Math.max(...topProducts.map((product) => product.total_reviews), 1);
  const stats = [
    { label: "Total Produk", value: summary.totalProducts, icon: Package },
    { label: "Total Review", value: summary.totalReviews, icon: Star },
    { label: "Scrape Berhasil", value: summary.successfulJobs, icon: CheckCircle2 },
    { label: "Scrape Gagal", value: summary.failedJobs, icon: XCircle },
    { label: "Scrape Terakhir", value: formatDate(summary.lastScrape), icon: Clock3 }
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Ringkasan produk, review, dan aktivitas scraping terbaru untuk dataset FemaleDaily."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.label}
              className="min-w-0 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-muted">{item.label}</p>
                  <p className="mt-2 break-words text-xl font-bold text-ink sm:text-2xl">
                    {item.value}
                  </p>
                </div>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-ink">
                  <Icon size={20} aria-hidden="true" />
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <RecentJobs jobs={jobs.slice(0, 5)} />
        <Card>
          <h2 className="font-semibold text-ink">Distribusi review</h2>
          <div className="mt-5 grid gap-4">
            {topProducts.length ? (
              topProducts.map((product) => (
                <div key={product.id}>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-ink">{product.product_name}</span>
                    <span className="shrink-0 text-ink-muted">{product.total_reviews}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(product.total_reviews / maxReviews) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-ink-muted">
                Belum ada review tersimpan. Jalankan scraping pertama untuk melihat distribusi.
              </p>
            )}
          </div>
        </Card>
      </section>
    </>
  );
}
