import { getSupabase } from "./supabase.js";
import { scrapeFemaleDailyProductPages } from "./scraper.js";
import { AppError } from "../utils/app-error.js";

type ExistingReview = {
  review_text: string;
  review_date: string | null;
  rating: number | null;
};

// Batas waktu keseluruhan satu job scraping. Kalau lewat, job ditandai gagal
// supaya tidak menggantung di status "running" selamanya.
const JOB_TIMEOUT_MS = 4 * 60 * 1000;

function withTimeout<T>(promise: Promise<T>, ms: number, code: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new AppError(code, 504, `Scrape job exceeded ${Math.round(ms / 1000)}s time limit`));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

export async function runScrapeJob(
  jobId: string,
  ownerId: string,
  sourceUrl: string,
  requestedReviews: number
) {
  try {
    await updateJob(jobId, ownerId, {
      status: "running",
      started_at: new Date().toISOString(),
      error_message: null
    });

    const result = await withTimeout(
      scrapeFemaleDailyProductPages(sourceUrl, requestedReviews, async (progress) => {
        await updateJob(jobId, ownerId, {
          total_reviews: progress.collectedReviews,
          requested_reviews: progress.requestedReviews
        });
      }),
      JOB_TIMEOUT_MS,
      "SCRAPE_TIMEOUT"
    );
    const product = await upsertProduct(ownerId, result.product);
    await insertNewReviews(ownerId, product.id, jobId, result.reviews);

    await updateJob(jobId, ownerId, {
      status: "success",
      // total_reviews = jumlah review yang berhasil di-scrape pada job ini,
      // bukan hanya yang baru masuk DB, supaya job hasil re-scrape tidak tampil 0.
      total_reviews: result.reviews.length,
      requested_reviews: result.requestedReviews,
      stop_reason: result.stopReason,
      finished_at: new Date().toISOString()
    });
  } catch (error) {
    const appError =
      error instanceof AppError
        ? error
        : new AppError("UNKNOWN_ERROR", 500, error instanceof Error ? error.message : "Unknown error");

    await updateJob(jobId, ownerId, {
      status: "failed",
      stop_reason: "PAGE_FAILED",
      error_message: appError.code,
      finished_at: new Date().toISOString()
    }).catch((updateError: unknown) => {
      console.error("Failed to update scrape job failure status", updateError);
    });

    console.error(`Scrape job ${jobId} failed`, appError.message);
  }
}

async function upsertProduct(ownerId: string, product: {
  product_name: string;
  brand_name: string;
  category: string | null;
  source_url: string;
}) {
  const { data, error } = await getSupabase()
    .from("products")
    .upsert({ ...product, owner_id: ownerId }, { onConflict: "owner_id,source_url" })
    .select("id")
    .single();

  if (error) throw new AppError("DATABASE_ERROR", 500, error.message);
  return data as { id: string };
}

async function insertNewReviews(
  ownerId: string,
  productId: string,
  jobId: string,
  reviews: Array<{
    rating: number | null;
    review_text: string;
    review_date: string | null;
    source_url: string;
  }>
) {
  const { data: existingData, error: existingError } = await getSupabase()
    .from("reviews")
    .select("review_text, review_date, rating")
    .eq("owner_id", ownerId)
    .eq("product_id", productId);

  if (existingError) throw new AppError("DATABASE_ERROR", 500, existingError.message);

  const existing = new Set(
    ((existingData ?? []) as ExistingReview[]).map((review) => duplicateKey(review))
  );

  const rows = reviews
    .filter((review) => {
      const key = duplicateKey(review);
      if (existing.has(key)) return false;
      existing.add(key);
      return true;
    })
    .map((review) => ({
      owner_id: ownerId,
      product_id: productId,
      scrape_job_id: jobId,
      rating: review.rating,
      review_text: review.review_text,
      review_date: review.review_date,
      source_url: review.source_url
    }));

  if (!rows.length) return [];

  const { data, error } = await getSupabase().from("reviews").insert(rows).select("id");
  if (error) throw new AppError("DATABASE_ERROR", 500, error.message);
  return data ?? [];
}

async function updateJob(jobId: string, ownerId: string, values: Record<string, unknown>) {
  const { error } = await getSupabase()
    .from("scrape_jobs")
    .update(values)
    .eq("id", jobId)
    .eq("owner_id", ownerId);
  if (error) throw new AppError("DATABASE_ERROR", 500, error.message);
}

function duplicateKey(review: ExistingReview) {
  return [review.review_text.trim().toLowerCase(), review.review_date ?? "", review.rating ?? ""].join(
    "::"
  );
}
