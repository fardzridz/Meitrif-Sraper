import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader title="Export" description="Memuat ringkasan export dataset." />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    </>
  );
}
