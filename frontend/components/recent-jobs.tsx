import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ScrapeJob } from "@/lib/types";
import { formatDate, formatJobStatus, formatStopReason } from "@/lib/utils";

export function RecentJobs({ jobs }: { jobs: ScrapeJob[] }) {
  return (
    <Card className="p-0">
      <div className="border-b border-line p-5">
        <h2 className="font-semibold text-ink">Riwayat scrape terbaru</h2>
      </div>
      <div className="divide-y divide-line">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="grid min-w-0 gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{job.source_url}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {formatDate(job.started_at)} · {job.total_reviews} / {job.requested_reviews ?? 10} review
                {job.stop_reason ? ` · ${formatStopReason(job.stop_reason)}` : ""}
              </p>
            </div>
            <Badge status={job.status}>{formatJobStatus(job.status)}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
