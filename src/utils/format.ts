/** Formats milliseconds as m:ss.cc (e.g. 1:05.32). */
export function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 10)); // centiseconds
  const cs = total % 100;
  const secs = Math.floor(total / 100) % 60;
  const mins = Math.floor(total / 6000);
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${mins}:${pad(secs)}.${pad(cs)}`;
}
