"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Box,
  Database,
  Download,
  SearchCheck
} from "lucide-react";
import { getAnonymousSession } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/scrape", label: "Scrape", icon: SearchCheck },
  { href: "/products", label: "Produk", icon: Box },
  { href: "/reviews", label: "Review", icon: Database },
  { href: "/export", label: "Ekspor", icon: Download }
];

const hcaptchaSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const captchaRef = useRef<HCaptcha>(null);
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
        if (error instanceof Error && error.message.includes("hCaptcha")) {
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
      captchaRef.current?.resetCaptcha();
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
            href={isLandingPage ? "/" : "/dashboard"}
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
            <span className="truncate">Metrif Scraper</span>
          </Link>

          {isLandingPage ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-[#10231C] shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              Mulai Scraper
            </Link>
          ) : (
            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Main navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
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
                  Selesaikan hCaptcha untuk membuat sesi anonim sebelum menggunakan scraper.
                </p>
              </div>
              {hcaptchaSiteKey ? (
                <HCaptcha
                  ref={captchaRef}
                  sitekey={hcaptchaSiteKey}
                  onVerify={(token) => void handleCaptchaVerify(token)}
                  onExpire={() => setAuthError("hCaptcha expired. Silakan verifikasi ulang.")}
                  onError={() => setAuthError("hCaptcha gagal dimuat. Coba refresh halaman.")}
                />
              ) : (
                <p className="text-sm font-medium text-danger">
                  NEXT_PUBLIC_HCAPTCHA_SITE_KEY belum dikonfigurasi.
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
