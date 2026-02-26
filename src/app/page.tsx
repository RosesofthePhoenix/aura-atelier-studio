import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { BolivianitaCrystal } from "@/components/bolivianita/BolivianitaCrystal";
import { homePillarsVerbatim, homeVerbatim } from "@/content/masterplan";
import { RitualButton } from "@/components/ui/RitualButton";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <BolivianitaCrystal className="h-full w-full opacity-75" activityLevel={1} />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(63,42,86,0.35),rgba(15,15,15,0.95))]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-8 md:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#D4AF37]">
              {homeVerbatim.tagline}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#B9A87A]">
              {homeVerbatim.subtitle}
            </p>
          </div>
          <nav className="flex items-center gap-5 text-xs uppercase tracking-[0.18em] text-[#D4AF37]/85">
            <Link href="/manifiesto" className="gold-link">
              Manifiesto
            </Link>
            <Link href="/capitulos/uyuni" className="gold-link">
              Uyuni
            </Link>
            <Link href="/by-appointment" className="gold-link">
              By Appointment
            </Link>
            <Link href="/val-vault" className="gold-link">
              Val Vault
            </Link>
          </nav>
        </header>

        <section className="my-10 max-w-3xl space-y-7">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
            <Sparkles className="h-3.5 w-3.5" />
            {homeVerbatim.tagline}
          </p>
          <h1 className="text-balance text-5xl leading-tight text-[#F6E7B8] md:text-7xl">
            {homeVerbatim.heroTitle}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[#D8D2C4]">
            {homeVerbatim.lead}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={homeVerbatim.primaryCta.href}>
              <RitualButton>{homeVerbatim.primaryCta.label}</RitualButton>
            </Link>
            <Link
              href={homeVerbatim.secondaryCta.href}
              className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/35 px-5 py-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37]"
            >
              {homeVerbatim.secondaryCta.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {homePillarsVerbatim.map((pillar) => (
            <article key={pillar.title} className="rounded-2xl aura-surface p-5">
              <h2 className="text-sm uppercase tracking-[0.18em] text-[#F5EFE3]">
                {pillar.title}
              </h2>
              <pre className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#CFC7B8]">
                {pillar.lines.join("\n")}
              </pre>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
