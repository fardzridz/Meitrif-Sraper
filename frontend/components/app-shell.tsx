"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Box,
  Brain,
  Database,
  Download,
  GitCompare,
  History,
  PlusCircle,
  SearchCheck,
  Settings
} from "lucide-react";
import { Turnstile, type TurnstileHandle } from "@/components/turnstile";
import { getAnonymousSession } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const scraperNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/scrape", label: "Scrape", icon: SearchCheck },
  { href: "/products", label: "Produk", icon: Box },
  { href: "/reviews", label: "Review", icon: Database },
  { href: "/export", label: "Ekspor", icon: Download }
];

const sentimentNavItems = [
  { href: "/sentiment", label: "Overview", icon: BarChart3 },
  { href: "/sentiment/new", label: "Analisis Baru", icon: PlusCircle },
  { href: "/sentiment/history", label: "Riwayat", icon: History },
  { href: "/sentiment/compare", label: "Bandingkan", icon: GitCompare },
  { href: "/sentiment/settings", label: "Pengaturan", icon: Settings }
];

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isSentimentSection = pathname.startsWith("/sentiment");
  const navItems = isSentimentSection ? sentimentNavItems : scraperNavItems;
  const captchaRef = useRef<TurnstileHandle>(null);
  const [authState, setAuthState] = useState<"checking" | "captcha" | "authenticating" | "ready" | "failed">("checking");
  const [authError, setAuthError] = useState("");
  const [interactionLoading, setInteractionLoading] = useState(false);

  useEffect(() => {
    if (isLandingPage) return;

    let active = true;

    getAnonymousSession()
      .then(() => {
        if (active) setAuthState("ready");
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof Error && error.message.includes("Turnstile")) {
          setAuthState("captcha");
          return;
        }

        setAuthError(error instanceof Error ? error.message : "Anonymous auth failed");
        setAuthState("failed");
      });

    return () => {
      active = false;
    };
  }, [isLandingPage]);

  async function handleCaptchaVerify(token: string) {
    setAuthState("authenticating");
    setAuthError("");

    try {
      await getAnonymousSession(token);
      setAuthState("ready");
    } catch (error) {
      captchaRef.current?.reset();
      setAuthError(error instanceof Error ? error.message : "Anonymous auth failed");
      setAuthState("captcha");
    }
  }

  function startInteractionLoading() {
    setInteractionLoading(true);
  }

  function handleShellClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const interactiveElement = target.closest("a, button");
    if (interactiveElement) startInteractionLoading();
  }

  useEffect(() => {
    if (!interactionLoading) return;

    const timer = window.setTimeout(() => {
      setInteractionLoading(false);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [interactionLoading, pathname]);

  const showHeaderLoading =
    interactionLoading ||
    (!isLandingPage && (authState === "checking" || authState === "authenticating"));

  return (
    <div className="min-h-screen bg-background text-ink" onClickCapture={handleShellClick}>
      <header className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur">
        <div
          className={cn(
            "mx-auto max-w-5xl px-4 md:px-6",
            isLandingPage ? "flex items-center justify-between gap-4 py-3" : "py-3"
          )}
        >
          <Link
            href={isLandingPage ? "/" : isSentimentSection ? "/sentiment" : "/dashboard"}
            className="flex min-w-0 items-center gap-2 font-bold"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden">
              <Image
                src="/brand/metrif-logo.svg"
                alt=""
                width={27}
                height={30}
                priority
              />
            </span>
            <span className="truncate">
              {isSentimentSection ? "Metrif Sentiment" : "Metrif Scraper"}
            </span>
          </Link>

          {isLandingPage ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-primary/10"
              >
                <SearchCheck size={15} aria-hidden="true" />
                Scraper
              </Link>
              <Link
                href="/sentiment"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-[#10231C] shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <Brain size={15} aria-hidden="true" />
                Sentiment
              </Link>
            </div>
          ) : (
            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Main navigation">
              <Link
                href="/"
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink-muted transition hover:bg-primary/10 hover:text-ink"
                title="Kembali ke beranda"
              >
                ←
              </Link>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/sentiment" && pathname.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink-muted transition hover:bg-primary/10 hover:text-ink",
                      active && "border-primary bg-primary/15 text-ink"
                    )}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
        {showHeaderLoading ? (
          <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-primary/15">
            <div className="h-full w-2/3 origin-left animate-[indeterminate_1.25s_ease-in-out_infinite] bg-primary" />
          </div>
        ) : null}
      </header>

      <main className="mx-auto min-w-0 max-w-5xl px-4 py-6 md:px-6 md:py-8">
        {isLandingPage ? (
          children
        ) : authState === "checking" || authState === "authenticating" ? (
          <div className="min-h-[50vh]" />
        ) : authState === "captcha" ? (
          <div className="grid min-h-[50vh] place-items-center">
            <div className="grid max-w-sm gap-4 rounded-md border border-line bg-white p-5 shadow-sm">
              <div>
                <h1 className="font-semibold text-ink">Verifikasi akses</h1>
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  Selesaikan verifikasi Turnstile untuk membuat sesi anonim sebelum menggunakan scraper.
                </p>
              </div>
              {turnstileSiteKey ? (
                <Turnstile
                  ref={captchaRef}
                  siteKey={turnstileSiteKey}
                  onVerify={(token) => void handleCaptchaVerify(token)}
                  onExpire={() => setAuthError("Verifikasi Turnstile kedaluwarsa. Silakan ulangi.")}
                  onError={() => setAuthError("Turnstile gagal dimuat. Coba refresh halaman.")}
                />
              ) : (
                <p className="text-sm font-medium text-danger">
                  NEXT_PUBLIC_TURNSTILE_SITE_KEY belum dikonfigurasi.
                </p>
              )}
              {authError ? <p className="text-sm font-medium text-danger">{authError}</p> : null}
            </div>
          </div>
        ) : authState === "failed" ? (
          <div className="rounded-md border border-danger/30 bg-red-50 p-5 text-sm font-medium text-danger">
            {authError}
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
