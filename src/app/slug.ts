// turns a display name into a URL-safe slug, e.g. "Salt Lake City" -> "salt-lake-city"
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
