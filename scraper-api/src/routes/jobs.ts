import { Router } from "express";
import { getOwnerId } from "../middleware/auth.js";
import { getSupabase } from "../services/supabase.js";
import { AppError } from "../utils/app-error.js";
import { parsePagination } from "../utils/pagination.js";
import { sendSuccess } from "../utils/response.js";

export const jobsRouter = Router();

jobsRouter.get("/", async (req, res, next) => {
  try {
    const ownerId = getOwnerId(req);
    const { from, to } = parsePagination(req.query.page, req.query.limit);
    const { data, error } = await getSupabase()
      .from("scrape_jobs")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new AppError("DATABASE_ERROR", 500, error.message);
    sendSuccess(res, data ?? []);
  } catch (error) {
    next(error);
  }
});

jobsRouter.get("/:id", async (req, res, next) => {
  try {
    const ownerId = getOwnerId(req);
    const { data, error } = await getSupabase()
      .from("scrape_jobs")
      .select("*")
      .eq("id", req.params.id)
      .eq("owner_id", ownerId)
      .single();

    if (error) throw new AppError("DATABASE_ERROR", 500, error.message);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});
