import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function isFemaleDailyReviewUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const isFemaleDaily =
      host === "reviews.femaledaily.com" || host.endsWith(".femaledaily.com");
    const blockedPath = /profile|users?|account|login|backend|image|photo/i.test(
      url.pathname
    );

    return url.protocol === "https:" && isFemaleDaily && !blockedPath;
  } catch {
    return false;
  }
}

export function formatStopReason(value?: string | null) {
  const labels: Record<string, string> = {
    TARGET_REACHED: "Target review tercapai",
    NO_MORE_REVIEWS: "Review sudah habis",
    PAGE_FAILED: "Halaman review gagal dibaca",
    MAX_LIMIT_REACHED: "Batas maksimum tercapai"
  };

  return value ? labels[value] ?? value : "";
}

export function formatJobStatus(value?: string | null) {
  const labels: Record<string, string> = {
    pending: "Menunggu",
    running: "Berjalan",
    success: "Berhasil",
    failed: "Gagal"
  };

  return value ? labels[value] ?? value : "";
}
