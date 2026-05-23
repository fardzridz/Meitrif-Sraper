"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    const timer = window.setTimeout(() => {
      getProducts(search)
        .then((data) => {
          if (active) setProducts(data);
        })
        .catch((requestError) => {
          if (active) {
            setError(requestError instanceof Error ? requestError.message : "Failed to load products");
            setProducts([]);
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
  }, [search]);

  return (
    <>
      <PageHeader
        title="Products"
        description="Daftar produk yang sudah tersimpan dari hasil scraping FemaleDaily."
      />
      <div className="mb-5 max-w-xl">
        <Input
          label="Search products"
          placeholder="Cari nama produk, brand, atau kategori"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-64" />
          ))}
        </section>
      ) : error ? (
        <EmptyState title="Products failed to load" description={error} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Tidak ada produk yang cocok dengan pencarian saat ini."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <Card
              key={product.id}
              className="grid min-w-0 gap-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-muted">{product.brand_name}</p>
                  <h2 className="mt-1 break-words text-lg font-bold text-ink">
                    {product.product_name}
                  </h2>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15">
                  <Search size={18} aria-hidden="true" />
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-ink-muted">Category</dt>
                  <dd className="mt-1 font-semibold">{product.category ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Reviews</dt>
                  <dd className="mt-1 font-semibold">{product.total_reviews}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-ink-muted">Created</dt>
                  <dd className="mt-1 font-semibold">{formatDate(product.created_at)}</dd>
                </div>
              </dl>
              <a
                href={product.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <ExternalLink size={16} aria-hidden="true" />
                View source
              </a>
            </Card>
          ))}
        </section>
      )}
    </>
  );
}
