"use client";

import { mockJobs, mockProducts, mockReviews, mockSummary } from "./mock-data";
import { getAccessToken, refreshAnonymousSession } from "./supabase";
import type { ApiResponse, DashboardSummary, Product, Review, ScrapeJob } from "./types";

const baseUrl = process.env.NEXT_PUBLIC_SCRAPER_API_URL;
const allowMockFallback = process.env.NODE_ENV !== "production";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!baseUrl) throw new Error("NEXT_PUBLIC_SCRAPER_API_URL is not configured");
  const token = await getAccessToken();

  const requestInit = {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers
    },
    cache: "no-store"
  } satisfies RequestInit;

  let response = await fetch(`${baseUrl}${path}`, requestInit);
  if (response.status === 401) {
    const refreshedSession = await refreshAnonymousSession();
    response = await fetch(`${baseUrl}${path}`, {
      ...requestInit,
      headers: {
        ...requestInit.headers,
        Authorization: `Bearer ${refreshedSession.access_token}`
      }
    });
  }

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.error ?? "API request failed");
  }

  return payload.data;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    return await request<DashboardSummary>("/stats");
  } catch {
    if (!allowMockFallback) throw new Error("Failed to load dashboard summary");
    return mockSummary;
  }
}

export async function getJobs(): Promise<ScrapeJob[]> {
  try {
    return await request<ScrapeJob[]>("/jobs");
  } catch {
    if (!allowMockFallback) throw new Error("Failed to load scrape jobs");
    return mockJobs;
  }
}

export async function getJob(id: string): Promise<ScrapeJob> {
  return request<ScrapeJob>(`/jobs/${id}`);
}

export async function getProducts(search = ""): Promise<Product[]> {
  try {
    return await request<Product[]>(`/products?search=${encodeURIComponent(search)}`);
  } catch {
    if (!allowMockFallback) throw new Error("Failed to load products");
    const term = search.toLowerCase();
    return mockProducts.filter((product) =>
      [product.product_name, product.brand_name, product.category ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }
}

export async function getReviews(filters: {
  search?: string;
  productId?: string;
  rating?: string;
  page?: number;
  limit?: number;
} = {}): Promise<Review[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.productId) params.set("product_id", filters.productId);
  if (filters.rating) params.set("rating", filters.rating);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  try {
    return await request<Review[]>(`/reviews?${params.toString()}`);
  } catch {
    if (!allowMockFallback) throw new Error("Failed to load reviews");
    const term = filters.search?.toLowerCase() ?? "";
    return mockReviews.filter((review) => {
      const matchesText = review.review_text.toLowerCase().includes(term);
      const matchesProduct = !filters.productId || review.product_id === filters.productId;
      const matchesRating = !filters.rating || String(review.rating) === filters.rating;
      return matchesText && matchesProduct && matchesRating;
    });
  }
}

export async function startScrape(
  sourceUrl: string,
  maxReviews: number,
  mode: "refresh" | "continue" = "refresh"
) {
  return request<{
    jobId: string;
    status: "running";
    requestedReviews: number;
    mode: "refresh" | "continue";
  }>("/scrape", {
    method: "POST",
    body: JSON.stringify({ sourceUrl, maxReviews, mode })
  });
}

export type ScrapeState = {
  exists: boolean;
  storedReviews: number;
  productName: string | null;
  brandName: string | null;
};

export async function checkScrapeState(sourceUrl: string): Promise<ScrapeState> {
  return request<ScrapeState>(`/scrape/check?sourceUrl=${encodeURIComponent(sourceUrl)}`);
}
