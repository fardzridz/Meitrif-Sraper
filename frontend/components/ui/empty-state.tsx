import type { ReactNode } from "react";
import { FileSearch } from "lucide-react";
import { Card } from "./card";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="grid justify-items-center gap-3 py-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/15 text-ink">
        <FileSearch size={22} aria-hidden="true" />
      </div>
      <div>
        <h3 className="font-semibold text-ink">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p>
      </div>
      {action}
    </Card>
  );
}
