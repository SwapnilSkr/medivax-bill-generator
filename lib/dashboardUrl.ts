/** Build `/dashboard` URLs while preserving tab, filters, etc. */
export function buildDashboardUrl(
  current: URLSearchParams,
  updates: Record<string, string | null | undefined>,
): string {
  const params = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value == null || value === "") params.delete(key);
    else params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
}
