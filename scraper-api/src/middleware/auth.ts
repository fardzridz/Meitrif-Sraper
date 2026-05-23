import type { NextFunction, Request, Response } from "express";
import { getSupabase } from "../services/supabase.js";
import { AppError } from "../utils/app-error.js";

declare global {
  namespace Express {
    interface Request {
      ownerId?: string;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authorization = req.header("authorization") ?? "";
    const [scheme, token] = authorization.split(" ");

    if (scheme?.toLowerCase() !== "bearer" || !token) {
      throw new AppError("UNAUTHORIZED", 401, "Missing Supabase access token");
    }

    const { data, error } = await getSupabase().auth.getUser(token);
    if (error || !data.user) {
      throw new AppError("UNAUTHORIZED", 401, "Invalid Supabase access token");
    }

    req.ownerId = data.user.id;
    next();
  } catch (error) {
    next(error);
  }
}

export function getOwnerId(req: Request) {
  if (!req.ownerId) {
    throw new AppError("UNAUTHORIZED", 401, "Missing authenticated owner");
  }

  return req.ownerId;
}
