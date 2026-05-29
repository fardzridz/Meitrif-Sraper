import { getSupabase } from "./supabase.js";
import { scrapeFemaleDailyProductPages } from "./scraper.js";
import { finishJobLog, logJob } from "./job-logger.js";
import { AppError } from "../utils/app-error.js";

type ExistingReview = {
  review_text: string;
  review_date: string | null;
  rating: number | null;
};

// Batas waktu satu job scraping. Menyesuaikan target review supaya target besar
// (mis. 250) tidak terpotong, tapi job yang benar-benar menggantung tetap dihentikan.
function jobTimeoutMs(requestedReviews: number) {
  const target = Number.isFinite(requestedReviews) ? requestedReviews : 10;
  const estimatedPages = Math.ceil(Math.min(Math.max(target, 10), 250) / 10);
  // ~9 detik per halaman (load + jeda 3 detik + margin) + buffer dasar 90 detik.
  return 90_000 + estimatedPages * 9_000;
}

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

export type ScrapeMode = "refresh" | "continue";

export async function runScrapeJob(
  jobId: string,
  ownerId: string,
  sourceUrl: string,
  requestedReviews: number,
  mode: ScrapeMode = "refresh"
) {
  try {
    await updateJob(jobId, ownerId, {
      status: "running",
      started_at: new Date().toISOString(),
      error_message: null
    });

    logJob(jobId, "info", `Job dimulai (mode: ${mode}).`);

    // Mode "continue": mulai dari halaman yang lebih dalam berdasarkan jumlah
    // review yang sudah tersimpan, supaya bisa menggali review lama (bukan hanya
    // mengulang review terbaru di halaman 1). FemaleDaily ~10 review per halaman.
    let startPage = 1;
    if (mode === "continue") {
      const existingCount = await countExistingReviews(ownerId, sourceUrl);
      startPage = Math.floor(existingCount / 10) + 1;
      logJob(
        jobId,
        "info",
        `Mode lanjutkan: ${existingCount} review tersimpan, mulai dari halaman ${startPage}.`
      );
    }

    const result = await withTimeout(
      scrapeFemaleDailyProductPages(
        sourceUrl,
        requestedReviews,
        async (progress) => {
          await updateJob(jobId, ownerId, {
            total_reviews: progress.collectedReviews,
            requested_reviews: progress.requestedReviews
          });
        },
        startPage,
        (level, message) => logJob(jobId, level, message)
      ),
      jobTimeoutMs(requestedReviews),
      "SCRAPE_TIMEOUT"
    );
    const product = await upsertProduct(ownerId, result.product);
    logJob(jobId, "info", "Menyimpan review ke database...");
    const inserted = await insertNewReviews(ownerId, product.id, jobId, result.reviews);
    logJob(jobId, "success", `${inserted.length} review baru disimpan ke database.`);

    await updateJob(jobId, ownerId, {
      status: "success",
      // total_reviews = jumlah review yang berhasil di-scrape pada job ini,
      // bukan hanya yang baru masuk DB, supaya job hasil re-scrape tidak tampil 0.
      total_reviews: result.reviews.length,
      requested_reviews: result.requestedReviews,
      stop_reason: result.stopReason,
      finished_at: new Date().toISOString()
    });
    logJob(jobId, "success", `Job selesai. Total review di-scrape: ${result.reviews.length}.`);
    finishJobLog(jobId);
  } catch (error) {
    const appError =
      error instanceof AppError
        ? error
        : new AppError("UNKNOWN_ERROR", 500, error instanceof Error ? error.message : "Unknown error");

    logJob(jobId, "error", `Job gagal: ${appError.code} - ${appError.message}`);

    await updateJob(jobId, ownerId, {
      status: "failed",
      stop_reason: "PAGE_FAILED",
      error_message: appError.code,
      finished_at: new Date().toISOString()
    }).catch((updateError: unknown) => {
      console.error("Failed to update scrape job failure status", updateError);
    });

    console.error(`Scrape job ${jobId} failed`, appError.message);
    finishJobLog(jobId);
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

async function countExistingReviews(ownerId: string, sourceUrl: string) {
  const { data: productData, error: productError } = await getSupabase()
    .from("products")
    .select("id")
    .eq("owner_id", ownerId)
    .eq("source_url", sourceUrl)
    .maybeSingle();

  if (productError) throw new AppError("DATABASE_ERROR", 500, productError.message);
  const product = productData as { id: string } | null;
  if (!product) return 0;

  const { count, error: countError } = await getSupabase()
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .eq("product_id", product.id);

  if (countError) throw new AppError("DATABASE_ERROR", 500, countError.message);
  return count ?? 0;
}

// Dipakai endpoint cek: apakah URL ini sudah pernah di-scrape owner & berapa
// review tersimpan, supaya frontend bisa menawarkan refresh atau continue.
export async function getProductScrapeState(ownerId: string, sourceUrl: string) {
  const { data: productData, error: productError } = await getSupabase()
    .from("products")
    .select("id, product_name, brand_name")
    .eq("owner_id", ownerId)
    .eq("source_url", sourceUrl)
    .maybeSingle();

  if (productError) throw new AppError("DATABASE_ERROR", 500, productError.message);
  const product = productData as
    | { id: string; product_name: string; brand_name: string }
    | null;

  if (!product) {
    return { exists: false, storedReviews: 0, productName: null, brandName: null };
  }

  const { count, error: countError } = await getSupabase()
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .eq("product_id", product.id);

  if (countError) throw new AppError("DATABASE_ERROR", 500, countError.message);

  return {
    exists: true,
    storedReviews: count ?? 0,
    productName: product.product_name,
    brandName: product.brand_name
  };
}
