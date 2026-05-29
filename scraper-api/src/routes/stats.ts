import { Router } from "express";
import { getOwnerId } from "../middleware/auth.js";
import { getSupabase } from "../services/supabase.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/response.js";

export const statsRouter = Router();

statsRouter.get("/", async (req, res, next) => {
  try {
    const ownerId = getOwnerId(req);
    const supabase = getSupabase();

    // Hitung total langsung di database (count) supaya tidak terbatas paginasi 20 baris.
    const [productsResult, reviewsResult, successResult, failedResult, lastScrapeResult] =
      await Promise.all([
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", ownerId),
        supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", ownerId),
        supabase
          .from("scrape_jobs")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", ownerId)
          .eq("status", "success"),
        supabase
          .from("scrape_jobs")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", ownerId)
          .eq("status", "failed"),
        supabase
          .from("scrape_jobs")
          .select("finished_at")
          .eq("owner_id", ownerId)
          .not("finished_at", "is", null)
          .order("finished_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

    for (const result of [
      productsResult,
      reviewsResult,
      successResult,
      failedResult,
      lastScrapeResult
    ]) {
      if (result.error) throw new AppError("DATABASE_ERROR", 500, result.error.message);
    }

    sendSuccess(res, {
      totalProducts: productsResult.count ?? 0,
      totalReviews: reviewsResult.count ?? 0,
      successfulJobs: successResult.count ?? 0,
      failedJobs: failedResult.count ?? 0,
      lastScrape: (lastScrapeResult.data as { finished_at?: string | null } | null)?.finished_at ?? null
    });
  } catch (error) {
    next(error);
  }
});
