export function PageHeader({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-normal text-ink md:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-base leading-7 text-ink-muted">{description}</p>
    </div>
  );
}
