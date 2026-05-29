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

export type JobLogEntry = {
  ts: string;
  level: "info" | "success" | "warn" | "error";
  message: string;
};

/**
 * Stream log scraping realtime via SSE. Memakai fetch streaming (bukan EventSource)
 * supaya token Supabase tetap dikirim lewat header Authorization, bukan di URL.
 * Memanggil onEntry untuk tiap baris log, dan onDone ketika job selesai.
 * Mengembalikan fungsi untuk membatalkan koneksi.
 */
export function streamJobLogs(
  jobId: string,
  handlers: { onEntry: (entry: JobLogEntry) => void; onDone?: () => void; onError?: (error: Error) => void }
): () => void {
  const controller = new AbortController();

  (async () => {
    if (!baseUrl) throw new Error("NEXT_PUBLIC_SCRAPER_API_URL is not configured");
    const token = await getAccessToken();

    const response = await fetch(`${baseUrl}/logs/${jobId}/stream`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok || !response.body) {
      throw new Error(`Log stream failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    // Parsing format SSE sederhana: blok dipisah "\n\n", tiap baris bisa
    // "event: ..." atau "data: ...".
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        const lines = block.split("\n");
        let eventName = "message";
        let data = "";
        for (const line of lines) {
          if (line.startsWith("event:")) eventName = line.slice(6).trim();
          else if (line.startsWith("data:")) data += line.slice(5).trim();
        }

        if (eventName === "done") {
          handlers.onDone?.();
          controller.abort();
          return;
        }

        if (data) {
          try {
            handlers.onEntry(JSON.parse(data) as JobLogEntry);
          } catch {
            // Abaikan baris non-JSON (mis. heartbeat).
          }
        }
      }
    }

    handlers.onDone?.();
  })().catch((error) => {
    if (controller.signal.aborted) return;
    handlers.onError?.(error instanceof Error ? error : new Error("Log stream error"));
  });

  return () => controller.abort();
}
