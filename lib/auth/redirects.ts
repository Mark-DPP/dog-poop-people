export function resolveRedirectTarget(
  search: URLSearchParams | string | null | undefined,
  fallback = "/admin/dashboard",
) {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;

  const candidate = params?.get("redirect_url")?.trim();

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }

  return candidate;
}

export function buildAuthRedirectPath(
  basePath: "/admin/login",
  currentPath: string,
  currentSearch = "",
) {
  const normalizedSearch =
    currentSearch.length === 0
      ? ""
      : currentSearch.startsWith("?")
        ? currentSearch
        : `?${currentSearch}`;

  return `${basePath}?redirect_url=${encodeURIComponent(
    `${currentPath}${normalizedSearch}`,
  )}`;
}
