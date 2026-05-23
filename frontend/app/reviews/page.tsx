"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts, getReviews } from "@/lib/api";
import type { Product, Review } from "@/lib/types";

const pageSize = 5;

export default function ReviewsPage() {
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [rating, setRating] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProducts()
      .then(setProducts)
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
        page,
        limit: pageSize
      })
        .then((data) => {
          if (active) setReviews(data);
        })
        .catch((requestError) => {
          if (active) {
            setError(requestError instanceof Error ? requestError.message : "Failed to load reviews");
            setReviews([]);
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [page, productId, rating, search]);

  const hasNextPage = reviews.length === pageSize;
  const visible = reviews;

  function resetPage(callback: () => void) {
    setPage(1);
    callback();
  }

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Tabel review untuk proses inspeksi, pencarian, filter, dan persiapan ekspor dataset."
      />

      <Card className="mb-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_160px]">
          <Input
            label="Search review text"
            placeholder="Cari kata di isi review"
            value={search}
            onChange={(event) => {
              resetPage(() => setSearch(event.target.value));
            }}
          />
          <label className="grid gap-2 text-sm font-medium text-ink">
            Product filter
            <select
              className="h-11 w-full rounded-md border border-line bg-white px-3 text-base focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              value={productId}
              onChange={(event) => {
                resetPage(() => setProductId(event.target.value));
              }}
            >
              <option value="">All products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.product_name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Rating
            <select
              className="h-11 w-full rounded-md border border-line bg-white px-3 text-base focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              value={rating}
              onChange={(event) => {
                resetPage(() => setRating(event.target.value));
              }}
            >
              <option value="">All ratings</option>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {loading ? (
        <Card className="p-5">
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        </Card>
      ) : error ? (
        <EmptyState title="Reviews failed to load" description={error} />
      ) : visible.length === 0 ? (
        <EmptyState title="No reviews found" description="Filter saat ini belum menemukan data review." />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-ink-muted">
                <tr>
                  {["Product", "Brand", "Rating", "Review Date", "Review Text", "Source URL"].map((head) => (
                    <th key={head} className="border-b border-line px-5 py-3 font-semibold">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((review) => (
                  <tr key={review.id} className="align-top">
                    <td className="px-5 py-4 font-semibold text-ink">{review.product_name}</td>
                    <td className="px-5 py-4 text-ink-muted">{review.brand_name}</td>
                    <td className="px-5 py-4 font-semibold">{review.rating ?? "-"}</td>
                    <td className="px-5 py-4 text-ink-muted">{review.review_date ?? "-"}</td>
                    <td className="max-w-md px-5 py-4 leading-6 text-ink">{review.review_text}</td>
                    <td className="px-5 py-4">
                      <a
                        className="font-semibold text-emerald-700 hover:underline"
                        href={review.source_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
            <p className="text-sm text-ink-muted">
              Page {page} · showing {visible.length} reviews
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
                <ChevronLeft size={16} aria-hidden="true" />
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={!hasNextPage}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
                <ChevronRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
