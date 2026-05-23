import { getSupabase } from "./supabase.js";
import { AppError } from "../utils/app-error.js";
import { parsePagination } from "../utils/pagination.js";

type ReviewFilters = {
  ownerId: string;
  search?: string;
  productId?: string;
  rating?: string;
  page?: unknown;
  limit?: unknown;
};

type ProductJoin = {
  product_name: string;
  brand_name: string;
  category: string | null;
};

type ReviewRow = {
  id: string;
  product_id: string;
  scrape_job_id: string;
  rating: number | null;
  review_text: string;
  review_date: string | null;
  source_url: string;
  created_at: string;
  products: ProductJoin | ProductJoin[] | null;
};

export async function getReviews(filters: ReviewFilters) {
  const { from, to } = parsePagination(filters.page, filters.limit);

  let query = getSupabase()
    .from("reviews")
    .select(
      "id, product_id, scrape_job_id, rating, review_text, review_date, source_url, created_at, products(product_name, brand_name, category)"
    )
    .eq("owner_id", filters.ownerId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    query = query.ilike("review_text", `%${filters.search}%`);
  }

  if (filters.productId) {
    query = query.eq("product_id", filters.productId);
  }

  if (filters.rating) {
    const rating = Number(filters.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new AppError("INVALID_RATING", 400, "Rating filter must be between 1 and 5");
    }
    query = query.eq("rating", rating);
  }

  const { data, error } = await query;
  if (error) throw new AppError("DATABASE_ERROR", 500, error.message);

  return ((data ?? []) as ReviewRow[]).map((review) => {
    const product = Array.isArray(review.products) ? review.products[0] : review.products;
    return {
      id: review.id,
      product_id: review.product_id,
      scrape_job_id: review.scrape_job_id,
      product_name: product?.product_name ?? "",
      brand_name: product?.brand_name ?? "",
      category: product?.category ?? null,
      rating: review.rating,
      review_date: review.review_date,
      review_text: review.review_text,
      source_url: review.source_url,
      scraped_at: review.created_at
    };
  });
}
