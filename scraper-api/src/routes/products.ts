import { Router } from "express";
import { getOwnerId } from "../middleware/auth.js";
import { getSupabase } from "../services/supabase.js";
import { AppError } from "../utils/app-error.js";
import { parsePagination } from "../utils/pagination.js";
import { sendSuccess } from "../utils/response.js";

export const productsRouter = Router();

productsRouter.get("/", async (req, res, next) => {
  try {
    const ownerId = getOwnerId(req);
    const search = String(req.query.search ?? "").trim();
    const { from, to } = parsePagination(req.query.page, req.query.limit);

    let query = getSupabase()
      .from("products")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      const term = search.replaceAll(",", " ");
      query = query.or(
        `product_name.ilike.%${term}%,brand_name.ilike.%${term}%,category.ilike.%${term}%`
      );
    }

    const { data, error } = await query;
    if (error) throw new AppError("DATABASE_ERROR", 500, error.message);

    const products = await Promise.all(
      (data ?? []).map(async (product: { id: string }) => {
        const { count, error: countError } = await getSupabase()
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", ownerId)
          .eq("product_id", product.id);

        if (countError) throw new AppError("DATABASE_ERROR", 500, countError.message);
        return { ...product, total_reviews: count ?? 0 };
      })
    );

    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
});
