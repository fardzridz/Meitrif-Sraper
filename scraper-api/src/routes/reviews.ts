import { Router } from "express";
import { getOwnerId } from "../middleware/auth.js";
import { getReviews } from "../services/reviews.js";
import { sendSuccess } from "../utils/response.js";

export const reviewsRouter = Router();

reviewsRouter.get("/", async (req, res, next) => {
  try {
    const reviews = await getReviews({
      ownerId: getOwnerId(req),
      search: String(req.query.search ?? "").trim(),
      productId: String(req.query.product_id ?? "").trim(),
      rating: String(req.query.rating ?? "").trim(),
      page: req.query.page,
      limit: req.query.limit
    });

    sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
});
