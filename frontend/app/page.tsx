import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Brain, Database, Download, SearchCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const products = [
  {
    title: "Review Scraper",
    description:
      "Kumpulkan review produk dari FemaleDaily secara otomatis. Input URL, jalankan scraping, dan ekspor dataset siap analisis.",
    icon: SearchCheck,
    href: "/dashboard",
    cta: "Mulai Scraping",
    features: ["Scraping otomatis", "Export CSV & JSON", "Real-time progress log"]
  },
  {
    title: "Sentiment Analysis",
    description:
      "Analisis sentimen profesional dengan AI. Deteksi emosi, aspek, keyword, dan topik dari review produk berbahasa Indonesia.",
    icon: Brain,
    href: "/sentiment",
    cta: "Mulai Analisis",
    features: ["Multi-model AI", "Aspect-based sentiment", "Visualisasi lengkap"]
  }
];

const flow = [
  {
    title: "Kumpulkan Data",
    description: "Scrape review dari FemaleDaily atau upload dataset sendiri (CSV/Excel).",
    icon: Database
  },
  {
    title: "Analisis dengan AI",
    description: "Pilih model (IndoBERT, OpenAI, Google NLP) dan jalankan analisis sentimen otomatis.",
    icon: Brain
  },
  {
    title: "Insight & Export",
    description: "Lihat dashboard visual, word cloud, tren, dan export laporan PDF profesional.",
    icon: Download
  }
];

export default function HomePage() {
  return (
    <div className="grid gap-12 pb-8">
      {/* Hero */}
      <section className="grid gap-8 pt-4 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pt-8">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-normal text-ink-muted">
            Data-Driven Review Intelligence
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-ink md:text-5xl">
            Scrape, analisis, dan pahami sentimen review produk.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted md:text-lg">
            Platform lengkap untuk mengumpulkan review dari FemaleDaily dan menganalisis
            sentimen secara profesional menggunakan AI — dari scraping hingga insight visual.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#products"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-[#10231C] shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              Pilih Produk
              <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a
              href="#alur"
              className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-primary/10"
            >
              Lihat Alur
            </a>
          </div>
        </div>

        <div className="grid min-h-[320px] place-items-center gap-5">
          <Image
            src="/brand/metrif-logo.svg"
            alt="Metrif Platform"
            width={422}
            height={463}
            priority
            className="h-auto w-full max-w-[280px] drop-shadow-[0_18px_32px_rgba(31,41,51,0.12)] md:max-w-[340px]"
          />
          <Image
            src="/brand/metrif-wordmark-tagline.svg"
            alt="Metrif Platform"
            width={520}
            height={122}
            priority
            className="h-auto w-full max-w-[360px]"
          />
        </div>
      </section>

      {/* Product Cards */}
      <section id="products" className="grid gap-6 md:grid-cols-2">
        {products.map((product) => {
          const Icon = product.icon;
          return (
            <Card key={product.title} className="grid gap-5 transition hover:shadow-lift">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-ink">
                  <Icon size={24} aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-ink">{product.title}</h2>
              </div>
              <p className="text-sm leading-6 text-ink-muted">{product.description}</p>
              <ul className="grid gap-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-ink-muted">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={product.href}
                className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-[#10231C] shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                {product.cta}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </Card>
          );
        })}
      </section>

      {/* Flow */}
      <section id="alur" className="grid gap-4 md:grid-cols-3">
        {flow.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="grid gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-ink">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <span className="text-sm font-bold text-ink-muted">0{index + 1}</span>
              </div>
              <div>
                <h2 className="font-bold text-ink">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{item.description}</p>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
