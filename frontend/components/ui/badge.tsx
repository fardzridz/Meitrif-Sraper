import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/lib/types";

const statusClass: Record<JobStatus, string> = {
  pending: "bg-slate-100 text-slate-700",
  running: "bg-cyan-50 text-cyan-700",
  success: "bg-primary/20 text-emerald-800",
  failed: "bg-red-50 text-danger"
};

export function Badge({
  className,
  status,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { status?: JobStatus }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-sm px-2.5 py-1 text-xs font-semibold",
        status ? statusClass[status] : "bg-slate-100 text-slate-700",
        className
      )}
      {...props}
    />
  );
}
