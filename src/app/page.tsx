import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { homeHeroContent } from "@/content/masterplan";
import { RitualButton } from "@/components/ui/RitualButton";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F0F0F]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(212,175,55,0.12),rgba(63,42,86,0.2),rgba(15,15,15,0.96))]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 md:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#D4AF37]">
              {homeHeroContent.tagline}
              <br />
              {homeHeroContent.subtitle}
            </p>
          </div>
          <nav className="flex items-center gap-5 text-xs uppercase tracking-[0.18em] text-[#D4AF37]/85">
            <Link href="/manifiesto" className="gold-link">
              MANIFIESTO
            </Link>
            <Link href="/by-appointment" className="gold-link">
              BY APPOINTMENT
            </Link>
            <Link href="/val-vault" className="gold-link">
              VAL VAULT
            </Link>
          </nav>
        </header>

        <section className="flex flex-1 items-center justify-center py-10">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
            <Image
              src="/brand/aura-atelier-logo.png"
              alt="Aura Atelier by V logo"
              width={320}
              height={320}
              priority
              className="h-auto w-[280px] md:w-[320px]"
            />

            <h1 className="text-balance text-5xl leading-tight text-[#F6E7B8] md:text-7xl">
              {homeHeroContent.heroTitle}
            </h1>

            <div className="max-w-3xl space-y-4 text-balance text-base leading-8 text-[#D8D2C4] md:text-lg">
              {homeHeroContent.mission.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href={homeHeroContent.primaryCta.href}>
                <RitualButton>{homeHeroContent.primaryCta.label}</RitualButton>
              </Link>
              <Link
                href={homeHeroContent.secondaryCta.href}
                className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/35 px-5 py-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37]"
              >
                {homeHeroContent.secondaryCta.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <Link href="/auth" className="gold-link text-xs uppercase tracking-[0.2em]">
              ENTRAR
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
