import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: {
    default: "Metrif Scraper | FemaleDaily Review Dataset Tool",
    template: "%s | Metrif Scraper"
  },
  description:
    "Metrif Scraper membantu mengumpulkan review produk FemaleDaily, memantau job scraping, dan mengekspor dataset CSV atau JSON untuk analisis.",
  applicationName: "Metrif Scraper",
  keywords: [
    "Metrif Scraper",
    "FemaleDaily scraper",
    "review scraper",
    "dataset review",
    "sentiment analysis",
    "CSV export",
    "JSON export"
  ],
  authors: [{ name: "Metrif Team" }],
  creator: "Metrif Team",
  publisher: "Metrif Team",
  icons: {
    icon: "/brand/metrif-logo.svg",
    shortcut: "/brand/metrif-logo.svg",
    apple: "/brand/metrif-logo.svg"
  },
  openGraph: {
    title: "Metrif Scraper",
    description:
      "Kumpulkan review FemaleDaily jadi dataset siap analisis dengan export CSV dan JSON.",
    siteName: "Metrif Scraper",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/brand/metrif-logo.svg",
        width: 422,
        height: 463,
        alt: "Metrif Scraper"
      }
    ]
  },
  twitter: {
    card: "summary",
    title: "Metrif Scraper",
    description:
      "Kumpulkan review FemaleDaily jadi dataset siap analisis dengan export CSV dan JSON.",
    images: ["/brand/metrif-logo.svg"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
