import { Router } from "express";
import { getOwnerId } from "../middleware/auth.js";
import { getReviews } from "../services/reviews.js";
import { sendSuccess } from "../utils/response.js";

export const exportRouter = Router();

const exportFields = [
  "product_name",
  "brand_name",
  "category",
  "rating",
  "review_date",
  "review_text",
  "source_url",
  "scraped_at"
] as const;

exportRouter.get("/json", async (req, res, next) => {
  try {
    const reviews = await getReviews({ ownerId: getOwnerId(req), limit: 10000 });
    sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
});

exportRouter.get("/csv", async (req, res, next) => {
  try {
    const reviews = await getReviews({ ownerId: getOwnerId(req), limit: 10000 });
    const rows = reviews.map((review) =>
      exportFields
        .map((field) => {
          const value = String(review[field] ?? "");
          return `"${value.replaceAll('"', '""')}"`;
        })
        .join(",")
    );

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=femaledaily-reviews.csv");
    res.send([exportFields.join(","), ...rows].join("\n"));
  } catch (error) {
    next(error);
  }
});
