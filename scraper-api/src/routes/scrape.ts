import { Router } from "express";
import { getOwnerId } from "../middleware/auth.js";
import { getProductScrapeState, runScrapeJob, type ScrapeMode } from "../services/scrape-job.js";
import { normalizeRequestedReviews } from "../services/scraper.js";
import { getSupabase } from "../services/supabase.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/response.js";
import { validateFemaleDailyUrl } from "../utils/validate-url.js";

export const scrapeRouter = Router();

function parseMode(value: unknown): ScrapeMode {
  return value === "continue" ? "continue" : "refresh";
}

scrapeRouter.get("/check", async (req, res, next) => {
  try {
    const ownerId = getOwnerId(req);
    const sourceUrl = String(req.query.sourceUrl ?? "").trim();
    if (!validateFemaleDailyUrl(sourceUrl)) {
      throw new AppError("INVALID_URL", 400, "Invalid FemaleDaily product URL");
    }

    const state = await getProductScrapeState(ownerId, sourceUrl);
    sendSuccess(res, state);
  } catch (error) {
    next(error);
  }
});

scrapeRouter.post("/", async (req, res, next) => {
  try {
    const ownerId = getOwnerId(req);
    const sourceUrl = String(req.body?.sourceUrl ?? "").trim();
    if (!validateFemaleDailyUrl(sourceUrl)) {
      throw new AppError("INVALID_URL", 400, "Invalid FemaleDaily product URL");
    }
    const requestedReviews = normalizeRequestedReviews(req.body?.maxReviews);
    const mode = parseMode(req.body?.mode);

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

    void runScrapeJob(data.id, ownerId, sourceUrl, requestedReviews, mode);

    sendSuccess(
      res,
      {
        jobId: data.id,
        status: data.status,
        requestedReviews: data.requested_reviews,
        mode
      },
      201
    );
  } catch (error) {
    next(error);
  }
});
