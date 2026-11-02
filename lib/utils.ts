import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format points with thousand separators (e.g. 420 or 1,250)
 */
export function formatPoints(points: number): string {
  return new Intl.NumberFormat("en-US").format(points);
}

/**
 * Format relative time (e.g. "3 hours ago", "2 days ago")
 * Hydration safe when called client-side or with fixed now reference.
 */
export function timeAgo(date: string | Date, now?: Date): string {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(d, {
      addSuffix: true,
      ...(now ? { baseDate: now } : {}),
    });
  } catch {
    return "recently";
  }
}

/**
 * Formats duration in seconds to "Xm Ys" (e.g. 342 -> "5m 42s")
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
}

/**
 * Generates official avatar head URL with requested size
 */
export function avatarUrl(username: string, size = 100): string {
  const clean = username.trim() || "Steve";
  return `https://mc-heads.net/head/${clean}/${size}`;
}

/**
 * Generates official full body skin render URL
 */
export function bodyUrl(username: string): string {
  const clean = username.trim() || "Steve";
  return `https://mc-heads.net/body/${clean}/200`;
}

/**
 * Standard slugify function
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Seeded Mulberry32 PRNG generator
 */
export function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
