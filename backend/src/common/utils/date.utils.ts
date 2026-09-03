


export function formatDbTime(raw: Date | null): string | null {
  if (!raw) return null;
  return `${String(raw.getHours()).padStart(2, "0")}:${String(raw.getMinutes()).padStart(2, "0")}`;
}


export  function combineDateAndTime(date: Date, time: Date | null): Date {
    const combined = new Date(date);
    if (time)
      combined.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
    return combined;
  }