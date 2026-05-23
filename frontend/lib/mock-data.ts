import type { DashboardSummary, Product, Review, ScrapeJob } from "./types";

export const mockJobs: ScrapeJob[] = [
  {
    id: "job-1042",
    source_url: "https://reviews.femaledaily.com/products/moisturizer/example",
    status: "success",
    total_reviews: 128,
    started_at: "2026-05-22T02:00:00.000Z",
    finished_at: "2026-05-22T02:03:00.000Z",
    created_at: "2026-05-22T02:00:00.000Z"
  },
  {
    id: "job-1041",
    source_url: "https://reviews.femaledaily.com/products/cleanser/example",
    status: "running",
    total_reviews: 42,
    started_at: "2026-05-22T01:40:00.000Z",
    finished_at: null,
    created_at: "2026-05-22T01:40:00.000Z"
  },
  {
    id: "job-1038",
    source_url: "https://reviews.femaledaily.com/products/sunscreen/example",
    status: "failed",
    total_reviews: 0,
    error_message: "PAGE_LOAD_TIMEOUT",
    started_at: "2026-05-21T09:15:00.000Z",
    finished_at: "2026-05-21T09:16:00.000Z",
    created_at: "2026-05-21T09:15:00.000Z"
  }
];

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    product_name: "Hydrating Gel Moisturizer",
    brand_name: "Wardah",
    category: "Moisturizer",
    source_url: "https://reviews.femaledaily.com/products/moisturizer/example",
    total_reviews: 128,
    created_at: "2026-05-22T02:03:00.000Z"
  },
  {
    id: "prod-2",
    product_name: "Low pH Gentle Cleanser",
    brand_name: "Somethinc",
    category: "Cleanser",
    source_url: "https://reviews.femaledaily.com/products/cleanser/example",
    total_reviews: 91,
    created_at: "2026-05-20T12:30:00.000Z"
  },
  {
    id: "prod-3",
    product_name: "Daily UV Shield SPF 50",
    brand_name: "Azarine",
    category: "Sunscreen",
    source_url: "https://reviews.femaledaily.com/products/sunscreen/example",
    total_reviews: 76,
    created_at: "2026-05-19T07:20:00.000Z"
  }
];

export const mockReviews: Review[] = [
  {
    id: "rev-1",
    product_id: "prod-1",
    product_name: "Hydrating Gel Moisturizer",
    brand_name: "Wardah",
    category: "Moisturizer",
    rating: 5,
    review_date: "22 May 2026",
    review_text:
      "Teksturnya ringan, cepat menyerap, dan cukup nyaman untuk kulit kombinasi. Setelah seminggu dipakai, area pipi terasa lebih lembap.",
    source_url: "https://reviews.femaledaily.com/products/moisturizer/example",
    scraped_at: "2026-05-22T02:03:00.000Z"
  },
  {
    id: "rev-2",
    product_id: "prod-2",
    product_name: "Low pH Gentle Cleanser",
    brand_name: "Somethinc",
    category: "Cleanser",
    rating: 4,
    review_date: "20 May 2026",
    review_text:
      "Tidak bikin ketarik setelah cuci muka. Busanya sedikit, tapi terasa bersih untuk pemakaian pagi dan malam.",
    source_url: "https://reviews.femaledaily.com/products/cleanser/example",
    scraped_at: "2026-05-20T12:30:00.000Z"
  },
  {
    id: "rev-3",
    product_id: "prod-3",
    product_name: "Daily UV Shield SPF 50",
    brand_name: "Azarine",
    category: "Sunscreen",
    rating: 3,
    review_date: "19 May 2026",
    review_text:
      "Proteksinya terasa oke, tapi di kulit saya agak mengilap setelah beberapa jam. Masih perlu bedak supaya finish-nya lebih nyaman.",
    source_url: "https://reviews.femaledaily.com/products/sunscreen/example",
    scraped_at: "2026-05-19T07:20:00.000Z"
  }
];

export const mockSummary: DashboardSummary = {
  totalProducts: mockProducts.length,
  totalReviews: mockProducts.reduce((total, product) => total + product.total_reviews, 0),
  successfulJobs: mockJobs.filter((job) => job.status === "success").length,
  failedJobs: mockJobs.filter((job) => job.status === "failed").length,
  lastScrape: mockJobs[0]?.finished_at
};
