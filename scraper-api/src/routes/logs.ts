import { Router } from "express";
import { getOwnerId } from "../middleware/auth.js";
import { getSupabase } from "../services/supabase.js";
import {
  getJobLogs,
  isJobDone,
  subscribeJobLogs,
  type JobLogEntry
} from "../services/job-logger.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/response.js";

export const logsRouter = Router();

async function assertJobOwnership(jobId: string, ownerId: string) {
  const { data, error } = await getSupabase()
    .from("scrape_jobs")
    .select("id")
    .eq("id", jobId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) throw new AppError("DATABASE_ERROR", 500, error.message);
  if (!data) throw new AppError("NOT_FOUND", 404, "Job not found");
}

// Snapshot log (non-streaming) sebagai fallback bila SSE tidak tersedia.
logsRouter.get("/:jobId", async (req, res, next) => {
  try {
    const ownerId = getOwnerId(req);
    await assertJobOwnership(req.params.jobId, ownerId);
    sendSuccess(res, {
      entries: getJobLogs(req.params.jobId),
      done: isJobDone(req.params.jobId)
    });
  } catch (error) {
    next(error);
  }
});

// Stream log realtime via Server-Sent Events.
logsRouter.get("/:jobId/stream", async (req, res, next) => {
  try {
    const ownerId = getOwnerId(req);
    const jobId = req.params.jobId;
    await assertJobOwnership(jobId, ownerId);

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    res.flushHeaders?.();

    const send = (entry: JobLogEntry) => {
      if (entry.message === "__done__") {
        res.write(`event: done\ndata: {}\n\n`);
        cleanup();
        res.end();
        return;
      }
      res.write(`data: ${JSON.stringify(entry)}\n\n`);
    };

    // Kirim dulu log yang sudah terkumpul supaya client yang telat tetap dapat histori.
    for (const entry of getJobLogs(jobId)) {
      res.write(`data: ${JSON.stringify(entry)}\n\n`);
    }

    if (isJobDone(jobId)) {
      res.write(`event: done\ndata: {}\n\n`);
      res.end();
      return;
    }

    const unsubscribe = subscribeJobLogs(jobId, send);
    // Heartbeat supaya koneksi tidak diputus proxy saat idle.
    const heartbeat = setInterval(() => res.write(`: ping\n\n`), 15_000);

    function cleanup() {
      clearInterval(heartbeat);
      unsubscribe();
    }

    req.on("close", () => {
      cleanup();
      res.end();
    });
  } catch (error) {
    next(error);
  }
});
