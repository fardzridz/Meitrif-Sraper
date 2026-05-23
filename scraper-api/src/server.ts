import cors from "cors";
import express from "express";
import { exportRouter } from "./routes/export.js";
import { healthRouter } from "./routes/health.js";
import { jobsRouter } from "./routes/jobs.js";
import { productsRouter } from "./routes/products.js";
import { reviewsRouter } from "./routes/reviews.js";
import { scrapeRouter } from "./routes/scrape.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./utils/error-handler.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.use("/health", healthRouter);
  app.use("/scrape", requireAuth, scrapeRouter);
  app.use("/jobs", requireAuth, jobsRouter);
  app.use("/products", requireAuth, productsRouter);
  app.use("/reviews", requireAuth, reviewsRouter);
  app.use("/export", requireAuth, exportRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
