export type JobStatus = "pending" | "running" | "success" | "failed";

export type ScrapeJob = {
  id: string;
  source_url: string;
  status: JobStatus;
  total_reviews: number;
  requested_reviews?: number;
  stop_reason?: string | null;
  error_message?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  product_name: string;
  brand_name: string;
  category?: string | null;
  source_url: string;
  total_reviews: number;
  created_at: string;
};

export type Review = {
  id: string;
  product_id: string;
  product_name: string;
  brand_name: string;
  category?: string | null;
  rating?: number | null;
  review_date?: string | null;
  review_text: string;
  source_url: string;
  scraped_at: string;
};

export type DashboardSummary = {
  totalProducts: number;
  totalReviews: number;
  successfulJobs: number;
  failedJobs: number;
  lastScrape?: string | null;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
