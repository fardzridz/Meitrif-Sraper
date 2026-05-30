"use client";

import { getAccessToken, refreshAnonymousSession } from "./supabase";
import type { ApiResponse } from "./types";
import type {
  AnalysisLogEntry,
  ModelInfo,
  PaginatedResponse,
  SentimentAnalysis,
  SentimentResult,
  UploadedDataset,
  UserApiKey
} from "./sentiment-types";

const baseUrl = process.env.NEXT_PUBLIC_SENTIMENT_API_URL;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!baseUrl) throw new Error("NEXT_PUBLIC_SENTIMENT_API_URL is not configured");
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
    throw new Error(payload.error ?? "Sentiment API request failed");
  }

  return payload.data;
}

// ─── Analysis ────────────────────────────────────────────────────────────────

export async function startAnalysis(params: {
  title: string;
  source_type: string;
  source_config: Record<string, unknown>;
  model: string;
  analysis_types: string[];
  topic_count?: number;
}): Promise<{ analysis_id: string; status: string; total_texts: number; stream_url: string }> {
  return request("/analyze", {
    method: "POST",
    body: JSON.stringify(params)
  });
}

export async function getAnalysis(id: string): Promise<SentimentAnalysis> {
  return request<SentimentAnalysis>(`/analysis/${id}`);
}

export async function getAnalyses(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedResponse<SentimentAnalysis>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.status) searchParams.set("status", params.status);
  return request<PaginatedResponse<SentimentAnalysis>>(`/analyses?${searchParams.toString()}`);
}

export async function deleteAnalysis(id: string): Promise<{ deleted: boolean }> {
  return request(`/analysis/${id}`, { method: "DELETE" });
}

export async function cancelAnalysis(id: string): Promise<{ status: string }> {
  return request(`/analysis/${id}/cancel`, { method: "POST" });
}

// ─── Results ─────────────────────────────────────────────────────────────────

export async function getAnalysisResults(
  id: string,
  params?: {
    page?: number;
    limit?: number;
    sentiment?: string;
    emotion?: string;
    search?: string;
  }
): Promise<PaginatedResponse<SentimentResult>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.sentiment) searchParams.set("sentiment", params.sentiment);
  if (params?.emotion) searchParams.set("emotion", params.emotion);
  if (params?.search) searchParams.set("search", params.search);
  return request<PaginatedResponse<SentimentResult>>(`/analysis/${id}/results?${searchParams.toString()}`);
}

// ─── Streaming ───────────────────────────────────────────────────────────────

export function streamAnalysisProgress(
  analysisId: string,
  handlers: {
    onEntry: (entry: AnalysisLogEntry) => void;
    onDone?: () => void;
    onError?: (error: Error) => void;
  }
): () => void {
  const controller = new AbortController();

  (async () => {
    if (!baseUrl) throw new Error("NEXT_PUBLIC_SENTIMENT_API_URL is not configured");
    const token = await getAccessToken();

    const response = await fetch(`${baseUrl}/analysis/${analysisId}/stream`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok || !response.body) {
      throw new Error(`Analysis stream failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

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
            const parsed = JSON.parse(data);
            const entry: AnalysisLogEntry = {
              ts: new Date().toISOString(),
              level: eventName === "error" ? "error" : "info",
              message: parsed.message ?? JSON.stringify(parsed),
              progress:
                parsed.current !== undefined
                  ? { current: parsed.current, total: parsed.total }
                  : undefined
            };

            if (eventName === "preview") {
              entry.level = "success";
              entry.message = `Preview: Positif ${parsed.positive} | Negatif ${parsed.negative} | Netral ${parsed.neutral}`;
            }

            handlers.onEntry(entry);
          } catch {
            // Ignore non-JSON lines
          }
        }
      }
    }

    handlers.onDone?.();
  })().catch((error) => {
    if (controller.signal.aborted) return;
    handlers.onError?.(error instanceof Error ? error : new Error("Analysis stream error"));
  });

  return () => controller.abort();
}

// ─── Upload ──────────────────────────────────────────────────────────────────

export async function uploadDataset(file: File, textColumn?: string): Promise<UploadedDataset> {
  if (!baseUrl) throw new Error("NEXT_PUBLIC_SENTIMENT_API_URL is not configured");
  const token = await getAccessToken();

  const formData = new FormData();
  formData.append("file", file);
  if (textColumn) formData.append("text_column", textColumn);

  const response = await fetch(`${baseUrl}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  const payload = (await response.json()) as ApiResponse<UploadedDataset>;
  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? "Upload failed");
  }

  return payload.data;
}

export async function getDatasets(): Promise<UploadedDataset[]> {
  return request<UploadedDataset[]>("/datasets");
}

export async function deleteDataset(id: string): Promise<{ deleted: boolean }> {
  return request(`/datasets/${id}`, { method: "DELETE" });
}

// ─── Models ──────────────────────────────────────────────────────────────────

export async function getModels(): Promise<ModelInfo[]> {
  return request<ModelInfo[]>("/models");
}

// ─── API Keys ────────────────────────────────────────────────────────────────

export async function getApiKeys(): Promise<UserApiKey[]> {
  return request<UserApiKey[]>("/api-keys");
}

export async function saveApiKey(provider: string, apiKey: string): Promise<UserApiKey> {
  return request<UserApiKey>("/api-keys", {
    method: "POST",
    body: JSON.stringify({ provider, api_key: apiKey })
  });
}

export async function deleteApiKey(provider: string): Promise<{ deleted: boolean }> {
  return request(`/api-keys/${provider}`, { method: "DELETE" });
}

// ─── Export ──────────────────────────────────────────────────────────────────

export async function exportAnalysisCsv(analysisId: string): Promise<Blob> {
  if (!baseUrl) throw new Error("NEXT_PUBLIC_SENTIMENT_API_URL is not configured");
  const token = await getAccessToken();

  const response = await fetch(`${baseUrl}/export/${analysisId}/csv`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error("Export CSV failed");
  return response.blob();
}

export async function exportAnalysisExcel(analysisId: string): Promise<Blob> {
  if (!baseUrl) throw new Error("NEXT_PUBLIC_SENTIMENT_API_URL is not configured");
  const token = await getAccessToken();

  const response = await fetch(`${baseUrl}/export/${analysisId}/excel`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error("Export Excel failed");
  return response.blob();
}

export async function exportAnalysisPdf(analysisId: string): Promise<Blob> {
  if (!baseUrl) throw new Error("NEXT_PUBLIC_SENTIMENT_API_URL is not configured");
  const token = await getAccessToken();

  const response = await fetch(`${baseUrl}/export/${analysisId}/pdf`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error("Export PDF failed");
  return response.blob();
}
