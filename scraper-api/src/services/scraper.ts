import { chromium, type Browser } from "playwright";
import { AppError } from "../utils/app-error.js";

export type ScrapedProduct = {
  product_name: string;
  brand_name: string;
  category: string | null;
  source_url: string;
};

export type ScrapedReview = {
  rating: number | null;
  review_text: string;
  review_date: string | null;
  source_url: string;
};

export type ScrapeResult = {
  product: ScrapedProduct;
  reviews: ScrapedReview[];
};

export type StopReason = "TARGET_REACHED" | "NO_MORE_REVIEWS" | "PAGE_FAILED" | "MAX_LIMIT_REACHED";

export type MultiPageScrapeResult = ScrapeResult & {
  stopReason: StopReason;
  requestedReviews: number;
};

// Hasil scrape satu halaman + jumlah "kartu review" mentah yang ditemukan
// di halaman (sebelum validasi teks). Dipakai untuk memutuskan apakah masih
// ada halaman berikutnya, supaya tidak berhenti hanya karena validasi membuang
// sebagian review pada satu halaman.
type PageScrapeResult = ScrapeResult & {
  rawReviewCount: number;
};

export type ScrapeProgress = {
  collectedReviews: number;
  requestedReviews: number;
  currentPage: number;
};

export async function assertPlaywrightAvailable() {
  const browser = await chromium.launch({ headless: true });
  await browser.close();
}

export async function scrapeFemaleDailyProduct(sourceUrl: string): Promise<ScrapeResult> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    });

    page.setDefaultTimeout(45_000);
    await page.goto(sourceUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
    await page.waitForTimeout(3_000);

    const extracted = (await page.evaluate(String.raw`
      (() => {
        function clean(value) {
          return (value || "").replace(/\s+/g, " ").trim();
        }

        function readableText(element) {
          if (!element) return "";
          const clone = element.cloneNode(true);
          clone
            .querySelectorAll("style, script, noscript, svg, img, button")
            .forEach((node) => node.remove());
          return clean(clone.textContent);
        }

        function firstText(selectors) {
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            const value = clean(element && element.textContent);
            if (value) return value;
          }
          return "";
        }

        function meta(name) {
          const element = document.querySelector(
            'meta[property="' + name + '"], meta[name="' + name + '"]'
          );
          return clean(element && element.content);
        }

        function parseRating(value) {
          const fromFive = value.match(/([1-5](?:\.\d)?)\s*(?:\/|out of)?\s*5/i);
          if (fromFive) return Number(fromFive[1]);

          const ratingWord = value.match(/rating\s*[:\-]?\s*([1-5](?:\.\d)?)/i);
          if (ratingWord) return Number(ratingWord[1]);

          return null;
        }

        function parseDate(value) {
          const longDate = value.match(/\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}\b/);
          if (longDate) return longDate[0];

          const shortDate = value.match(/\b\d{1,2}\s+[A-Za-z]{3,9}\b/);
          if (shortDate) return shortDate[0];

          const numericDate = value.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/);
          if (numericDate) return numericDate[0];

          return null;
        }

        function exactReviewText(container) {
          const element = container.querySelector(".review-content-wrapper .text-content");
          return readableText(element);
        }

        function exactReviewDate(container) {
          return clean(container.querySelector(".review-date") && container.querySelector(".review-date").textContent);
        }

        function exactRating(container) {
          const stars = container.querySelectorAll(
            ".review-card-rating-wrapper .cardrv-starlist i.icon-ic_big_star_full"
          );
          return stars.length || null;
        }

        const title = meta("og:title") || document.title || "";
        const productName =
          firstText([
            "h1",
            "[class*='product'][class*='name']",
            "[data-testid*='product'][data-testid*='name']"
          ]) ||
          clean(title.split("|")[0]) ||
          "Unknown Product";

        const brandName =
          firstText([
            "[class*='brand'][class*='name']",
            "[data-testid*='brand']",
            "a[href*='/brands/']",
            "[class*='brand']"
          ]) || "Unknown Brand";

        const breadcrumbs = Array.from(
          document.querySelectorAll("nav a, [class*='breadcrumb'] a, [class*='breadcrumb'] span")
        )
          .map((element) => clean(element.textContent))
          .filter(Boolean);
        const category = breadcrumbs.length ? breadcrumbs[breadcrumbs.length - 1] : null;

        const exactContainers = Array.from(document.querySelectorAll(".list-reviews .review-card"));
        const containers = exactContainers.length
          ? exactContainers
          : Array.from(
              document.querySelectorAll(
                [
                  "[class*='review-card']",
                  "[class*='reviewCard']",
                  "[class*='review-item']",
                  "[class*='reviewItem']",
                  "[data-testid*='review']",
                  "article"
                ].join(",")
              )
            );

        const seen = new Set();
        const reviews = containers
          .map((container) => {
            const text = readableText(container);
            if (text.length < 40) return null;
            if (/write a review|login|register|add review/i.test(text)) return null;

            const reviewText =
              exactReviewText(container) ||
              readableText(
                container.querySelector(
                  [
                    "[class*='review-text']",
                    "[class*='reviewText']",
                    "[class*='review-content']",
                    "[class*='reviewContent']",
                    "[class*='description']",
                    "[class*='content']",
                    "p"
                  ].join(",")
                ) || container
              );
            if (reviewText.length < 30) return null;

            const ratingSource = [
              container.getAttribute("aria-label"),
              container.getAttribute("title"),
              container.querySelector("[aria-label*='5']") &&
                container.querySelector("[aria-label*='5']").getAttribute("aria-label"),
              container.querySelector("[title*='5']") &&
                container.querySelector("[title*='5']").getAttribute("title"),
              text
            ]
              .filter(Boolean)
              .join(" ");

            const key = reviewText.toLowerCase();
            if (seen.has(key)) return null;
            seen.add(key);

            return {
              rating: exactRating(container) || parseRating(ratingSource),
              review_text: reviewText,
              review_date: exactReviewDate(container) || parseDate(text),
              source_url: window.location.href
            };
          })
          .filter(Boolean);

        return {
          product: {
            product_name: productName,
            brand_name: brandName,
            category,
            source_url: window.location.href
          },
          reviews
        };
      })()
    `)) as {
      product: ScrapedProduct;
      reviews: ScrapedReview[];
    };

    const reviews = extracted.reviews
      .map((review) => ({
        rating: normalizeRating(review?.rating),
        review_text: cleanReviewText(review?.review_text ?? ""),
        review_date: cleanText(review?.review_date ?? "") || null,
        source_url: sourceUrl
      }))
      .filter((review) => isValidReviewText(review.review_text));

    if (!reviews.length) {
      throw new AppError("NO_REVIEWS_FOUND", 404, "No reviews found on the product page");
    }

    return {
      product: {
        product_name: cleanText(extracted.product.product_name) || "Unknown Product",
        brand_name: cleanText(extracted.product.brand_name) || "Unknown Brand",
        category: cleanText(extracted.product.category ?? "") || null,
        source_url: sourceUrl
      },
      reviews
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    const message = error instanceof Error ? error.message : "Scraper failed";
    throw new AppError("SCRAPER_FAILED", 500, message);
  } finally {
    await browser?.close().catch(() => undefined);
  }
}

export async function scrapeFemaleDailyProductPages(
  sourceUrl: string,
  requestedReviews: number,
  onProgress?: (progress: ScrapeProgress) => Promise<void>,
  startPage = 1
): Promise<MultiPageScrapeResult> {
  const targetReviews = normalizeRequestedReviews(requestedReviews);
  const firstPage = Math.max(Math.floor(startPage), 1);
  // Batas halaman aman: target/10 sebagai dasar, tapi diberi kelonggaran besar
  // karena sebagian review bisa tersaring oleh validasi teks. Loop tetap berhenti
  // sendiri begitu halaman benar-benar kosong atau target tercapai.
  const maxPages = Math.max(Math.ceil(targetReviews / 10) * 5, 50);
  const lastPage = firstPage + maxPages - 1;
  let browser: Browser | null = null;
  let product: ScrapedProduct | null = null;
  const reviews: ScrapedReview[] = [];
  const seen = new Set<string>();
  let stopReason: StopReason = "TARGET_REACHED";

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    });
    page.setDefaultTimeout(45_000);

    // Hitung berapa halaman beruntun yang tidak menambah review unik baru.
    // Dipakai sebagai pengaman supaya scraping berhenti hanya kalau benar-benar
    // tidak ada review baru, bukan karena satu halaman kebetulan sedikit yang valid.
    let consecutiveEmptyPages = 0;

    for (let pageNumber = firstPage; pageNumber <= lastPage; pageNumber += 1) {
      const pageUrl = buildReviewPageUrl(sourceUrl, pageNumber);

      try {
        const result = await scrapeFemaleDailyProductPage(page, pageUrl, sourceUrl);
        product = product ?? result.product;

        // Halaman benar-benar tidak punya kartu review sama sekali => review habis.
        if (result.rawReviewCount === 0) {
          stopReason = "NO_MORE_REVIEWS";
          break;
        }

        let addedThisPage = 0;
        for (const review of result.reviews) {
          const key = [review.review_text.toLowerCase(), review.review_date ?? "", review.rating ?? ""].join(
            "::"
          );
          if (seen.has(key)) continue;
          seen.add(key);
          reviews.push(review);
          addedThisPage += 1;
          if (reviews.length >= targetReviews) break;
        }

        await onProgress?.({
          collectedReviews: reviews.length,
          requestedReviews: targetReviews,
          currentPage: pageNumber
        });

        if (reviews.length >= targetReviews) {
          stopReason = targetReviews >= 250 ? "MAX_LIMIT_REACHED" : "TARGET_REACHED";
          break;
        }

        // Tidak ada review unik baru di halaman ini. Bisa karena duplikat atau
        // tersaring validasi. Beri toleransi beberapa halaman sebelum menyerah.
        if (addedThisPage === 0) {
          consecutiveEmptyPages += 1;
          if (consecutiveEmptyPages >= 3) {
            stopReason = "NO_MORE_REVIEWS";
            break;
          }
        } else {
          consecutiveEmptyPages = 0;
        }

        await page.waitForTimeout(3_000);
      } catch (error) {
        if (reviews.length > 0 && product) {
          stopReason = "PAGE_FAILED";
          break;
        }
        throw error;
      }
    }

    if (!product || !reviews.length) {
      throw new AppError("NO_REVIEWS_FOUND", 404, "No reviews found on the product page");
    }

    return {
      product,
      reviews,
      stopReason,
      requestedReviews: targetReviews
    };
  } finally {
    await browser?.close().catch(() => undefined);
  }
}

async function scrapeFemaleDailyProductPage(
  page: Awaited<ReturnType<Browser["newPage"]>>,
  pageUrl: string,
  sourceUrl: string
): Promise<PageScrapeResult> {
  try {
    await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
    await page.waitForTimeout(2_000);

    const extracted = (await page.evaluate(String.raw`
      (() => {
        function clean(value) {
          return (value || "").replace(/\s+/g, " ").trim();
        }

        function readableText(element) {
          if (!element) return "";
          const clone = element.cloneNode(true);
          clone
            .querySelectorAll("style, script, noscript, svg, img, button")
            .forEach((node) => node.remove());
          return clean(clone.textContent);
        }

        function firstText(selectors) {
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            const value = clean(element && element.textContent);
            if (value) return value;
          }
          return "";
        }

        function meta(name) {
          const element = document.querySelector(
            'meta[property="' + name + '"], meta[name="' + name + '"]'
          );
          return clean(element && element.content);
        }

        function parseRating(value) {
          const fromFive = value.match(/([1-5](?:\.\d)?)\s*(?:\/|out of)?\s*5/i);
          if (fromFive) return Number(fromFive[1]);

          const ratingWord = value.match(/rating\s*[:\-]?\s*([1-5](?:\.\d)?)/i);
          if (ratingWord) return Number(ratingWord[1]);

          return null;
        }

        function parseDate(value) {
          const longDate = value.match(/\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}\b/);
          if (longDate) return longDate[0];

          const shortDate = value.match(/\b\d{1,2}\s+[A-Za-z]{3,9}\b/);
          if (shortDate) return shortDate[0];

          const numericDate = value.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/);
          if (numericDate) return numericDate[0];

          return null;
        }

        function exactReviewText(container) {
          const element = container.querySelector(".review-content-wrapper .text-content");
          return readableText(element);
        }

        function exactReviewDate(container) {
          return clean(container.querySelector(".review-date") && container.querySelector(".review-date").textContent);
        }

        function exactRating(container) {
          const stars = container.querySelectorAll(
            ".review-card-rating-wrapper .cardrv-starlist i.icon-ic_big_star_full"
          );
          return stars.length || null;
        }

        const title = meta("og:title") || document.title || "";
        const productName =
          firstText([
            "h1",
            "[class*='product'][class*='name']",
            "[data-testid*='product'][data-testid*='name']"
          ]) ||
          clean(title.split("|")[0]) ||
          "Unknown Product";

        const brandName =
          firstText([
            "[class*='brand'][class*='name']",
            "[data-testid*='brand']",
            "a[href*='/brands/']",
            "[class*='brand']"
          ]) || "Unknown Brand";

        const breadcrumbs = Array.from(
          document.querySelectorAll("nav a, [class*='breadcrumb'] a, [class*='breadcrumb'] span")
        )
          .map((element) => clean(element.textContent))
          .filter(Boolean);
        const category = breadcrumbs.length ? breadcrumbs[breadcrumbs.length - 1] : null;

        const exactContainers = Array.from(document.querySelectorAll(".list-reviews .review-card"));
        const containers = exactContainers.length
          ? exactContainers
          : Array.from(
              document.querySelectorAll(
                [
                  "[class*='review-card']",
                  "[class*='reviewCard']",
                  "[class*='review-item']",
                  "[class*='reviewItem']",
                  "[data-testid*='review']",
                  "article"
                ].join(",")
              )
            );

        const seen = new Set();
        const reviews = containers
          .map((container) => {
            const text = readableText(container);
            if (text.length < 40) return null;
            if (/write a review|login|register|add review/i.test(text)) return null;

            const reviewText =
              exactReviewText(container) ||
              readableText(
                container.querySelector(
                  [
                    "[class*='review-text']",
                    "[class*='reviewText']",
                    "[class*='review-content']",
                    "[class*='reviewContent']",
                    "[class*='description']",
                    "[class*='content']",
                    "p"
                  ].join(",")
                ) || container
              );
            if (reviewText.length < 30) return null;

            const ratingSource = [
              container.getAttribute("aria-label"),
              container.getAttribute("title"),
              container.querySelector("[aria-label*='5']") &&
                container.querySelector("[aria-label*='5']").getAttribute("aria-label"),
              container.querySelector("[title*='5']") &&
                container.querySelector("[title*='5']").getAttribute("title"),
              text
            ]
              .filter(Boolean)
              .join(" ");

            const key = reviewText.toLowerCase();
            if (seen.has(key)) return null;
            seen.add(key);

            return {
              rating: exactRating(container) || parseRating(ratingSource),
              review_text: reviewText,
              review_date: exactReviewDate(container) || parseDate(text),
              source_url: window.location.href
            };
          })
          .filter(Boolean);

        return {
          product: {
            product_name: productName,
            brand_name: brandName,
            category,
            source_url: window.location.href
          },
          reviews,
          rawReviewCount: containers.length
        };
      })()
    `)) as {
      product: ScrapedProduct;
      reviews: ScrapedReview[];
      rawReviewCount: number;
    };

    const reviews = extracted.reviews
      .map((review) => ({
        rating: normalizeRating(review?.rating),
        review_text: cleanReviewText(review?.review_text ?? ""),
        review_date: cleanText(review?.review_date ?? "") || null,
        source_url: sourceUrl
      }))
      .filter((review) => isValidReviewText(review.review_text));

    return {
      product: {
        product_name: cleanText(extracted.product.product_name) || "Unknown Product",
        brand_name: cleanText(extracted.product.brand_name) || "Unknown Brand",
        category: cleanText(extracted.product.category ?? "") || null,
        source_url: sourceUrl
      },
      reviews,
      rawReviewCount: extracted.rawReviewCount ?? 0
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    const message = error instanceof Error ? error.message : "Scraper failed";
    throw new AppError("SCRAPER_FAILED", 500, message);
  }
}

export function normalizeRequestedReviews(value: unknown) {
  const parsed = Number(value ?? 10);
  if (!Number.isFinite(parsed)) return 10;
  const rounded = Math.ceil(parsed / 10) * 10;
  return Math.min(Math.max(rounded, 10), 250);
}

function buildReviewPageUrl(sourceUrl: string, pageNumber: number) {
  const url = new URL(sourceUrl);
  url.searchParams.set("cat", url.searchParams.get("cat") ?? "");
  url.searchParams.set("cat_id", url.searchParams.get("cat_id") ?? "0");
  url.searchParams.set("age_range", url.searchParams.get("age_range") ?? "");
  url.searchParams.set("skin_type", url.searchParams.get("skin_type") ?? "");
  url.searchParams.set("skin_tone", url.searchParams.get("skin_tone") ?? "");
  url.searchParams.set("skin_undertone", url.searchParams.get("skin_undertone") ?? "");
  url.searchParams.set("hair_texture", url.searchParams.get("hair_texture") ?? "");
  url.searchParams.set("hair_type", url.searchParams.get("hair_type") ?? "");
  url.searchParams.set("order", url.searchParams.get("order") ?? "newest");
  url.searchParams.set("page", String(pageNumber));
  return url.toString();
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function cleanReviewText(value: string) {
  return cleanText(value)
    .replace(/\.[a-z0-9_-]+\s*\{[^}]*\}/gi, " ")
    .replace(/\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}\b/g, " ")
    .replace(/^\d{1,2}\s+[A-Za-z]{3,9}\b\s*/g, " ")
    .replace(/\b[\w.-]+\s+(?:recommends|doesn't recommend)\s+this product!?/gi, " ")
    .replace(/Usage\s*Period\s*:\s*.*?(?=Purchase\s*Point\s*:|$)/i, " ")
    .replace(/Purchase\s*Point\s*:\s*.*$/i, " ")
    .replace(/\blist-image\b.*$/i, " ")
    .replace(/\s+[0-9]{1,2}$/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidReviewText(value: string) {
  if (value.length < 35) return false;
  if (/\{|\}|display\s*:|font-size\s*:|margin-right\s*:/i.test(value)) return false;
  if (/^[\w.-]+\s*(?:18 and Under|\d{2}\s*-\s*\d{2})\s*(?:Normal|Oily|Dry|Combination|Sensitive|Light|Medium|Dark|Warm|Cool|Neutral|,\s*)+$/i.test(value)) {
    return false;
  }
  if (!/[.!?]|aku|saya|kulit|produk|toner|cocok|pakai|bikin|jerawat/i.test(value)) {
    return false;
  }
  return true;
}

function normalizeRating(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  const rounded = Math.round(value);
  return rounded >= 1 && rounded <= 5 ? rounded : null;
}
