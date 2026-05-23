import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader title="Reviews" description="Memuat tabel review." />
      <Skeleton className="mb-5 h-28" />
      <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="grid gap-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-12" />
          ))}
        </div>
      </div>
    </>
  );
}
