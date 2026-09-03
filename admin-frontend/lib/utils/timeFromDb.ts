export function timeFromDb(raw: string | null): string {
  if (!raw) return "";
  if (/^\d{2}:\d{2}/.test(raw)) return raw.slice(0, 5);
  const match = raw.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : "";
}