import { Router } from "express";
import { getOwnerId } from "../middleware/auth.js";
import { runScrapeJob } from "../services/scrape-job.js";
import { normalizeRequestedReviews } from "../services/scraper.js";
import { getSupabase } from "../services/supabase.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/response.js";
import { validateFemaleDailyUrl } from "../utils/validate-url.js";

export const scrapeRouter = Router();

scrapeRouter.post("/", async (req, res, next) => {
  try {
    const ownerId = getOwnerId(req);
    const sourceUrl = String(req.body?.sourceUrl ?? "").trim();
    if (!validateFemaleDailyUrl(sourceUrl)) {
      throw new AppError("INVALID_URL", 400, "Invalid FemaleDaily product URL");
    }
    const requestedReviews = normalizeRequestedReviews(req.body?.maxReviews);

    const { data, error } = await getSupabase()
      .from("scrape_jobs")
      .insert({
        owner_id: ownerId,
        source_url: sourceUrl,
        status: "running",
        requested_reviews: requestedReviews,
        started_at: new Date().toISOString()
      })
      .select("id, status, requested_reviews")
      .single();

    if (error) throw new AppError("DATABASE_ERROR", 500, error.message);

    void runScrapeJob(data.id, ownerId, sourceUrl, requestedReviews);

    sendSuccess(
      res,
      {
        jobId: data.id,
        status: data.status,
        requestedReviews: data.requested_reviews
      },
      201
    );
  } catch (error) {
    next(error);
  }
});
