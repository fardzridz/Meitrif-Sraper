import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: {
    default: "Metrif | Review Scraper & Sentiment Analysis Platform",
    template: "%s | Metrif"
  },
  description:
    "Metrif membantu mengumpulkan review produk FemaleDaily dan menganalisis sentimen secara profesional menggunakan AI — dari scraping hingga insight visual.",
  applicationName: "Metrif",
  keywords: [
    "Metrif",
    "FemaleDaily scraper",
    "review scraper",
    "sentiment analysis",
    "analisis sentimen",
    "dataset review",
    "NLP Indonesia",
    "IndoBERT",
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
    title: "Metrif",
    description:
      "Scrape review FemaleDaily dan analisis sentimen profesional dengan AI.",
    siteName: "Metrif",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/brand/metrif-logo.svg",
        width: 422,
        height: 463,
        alt: "Metrif"
      }
    ]
  },
  twitter: {
    card: "summary",
    title: "Metrif",
    description:
      "Scrape review FemaleDaily dan analisis sentimen profesional dengan AI.",
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
