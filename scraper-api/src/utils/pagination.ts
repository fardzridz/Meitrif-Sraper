export function parsePagination(pageInput: unknown, limitInput: unknown) {
  const page = Math.max(Number(pageInput ?? 1), 1);
  const limit = Math.min(Math.max(Number(limitInput ?? 20), 1), 10000);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return { page, limit, from, to };
}
