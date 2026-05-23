const blockedPathPattern = /profile|users?|account|login|backend|image|photo|avatar/i;

export function validateFemaleDailyUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const isFemaleDaily =
      host === "reviews.femaledaily.com" || host.endsWith(".femaledaily.com");

    return url.protocol === "https:" && isFemaleDaily && !blockedPathPattern.test(url.pathname);
  } catch {
    return false;
  }
}
