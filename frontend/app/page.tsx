import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Database, Download, SearchCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const flow = [
  {
    title: "Masukkan URL produk",
    description: "Tempel URL review produk FemaleDaily yang ingin dikumpulkan.",
    icon: SearchCheck
  },
  {
    title: "Scraper berjalan",
    description: "Backend mengambil review sesuai target dan berhenti otomatis saat data habis.",
    icon: Database
  },
  {
    title: "Kelola dataset",
    description: "Produk, review, status job, dan ekspor CSV bisa dipantau dari dashboard.",
    icon: Download
  }
];

export default function HomePage() {
  return (
    <div className="grid gap-10 pb-8">
      <section className="grid gap-8 pt-4 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pt-8">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-normal text-ink-muted">
            FemaleDaily Review Dataset Tool
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-ink md:text-5xl">
            Kumpulkan review produk FemaleDaily jadi dataset siap analisis.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted md:text-lg">
            Web ini membantu input URL produk, menjalankan scraping lewat backend,
            memantau status job, melihat produk dan review yang tersimpan, lalu
            mengekspor hasilnya ke CSV.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-[#10231C] shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              Mulai Scraper
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
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
            alt="Metrif Scraper"
            width={422}
            height={463}
            priority
            className="h-auto w-full max-w-[280px] drop-shadow-[0_18px_32px_rgba(31,41,51,0.12)] md:max-w-[340px]"
          />
          <Image
            src="/brand/metrif-wordmark-tagline.svg"
            alt="Metrif Scraper"
            width={520}
            height={122}
            priority
            className="h-auto w-full max-w-[360px]"
          />
        </div>
      </section>

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
