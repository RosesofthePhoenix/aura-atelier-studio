import Link from "next/link";
import { uyuniChapterVerbatim } from "@/content/masterplan";

export default function UyuniChapterPage() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-10">
      <section className="mx-auto w-full max-w-4xl rounded-3xl aura-surface p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.22em] text-[#D4AF37]/85">Capítulo 01</p>
        <h1 className="mt-3 text-4xl text-[#F6E7B8] md:text-5xl">Uyuni</h1>
        <pre className="mt-8 whitespace-pre-wrap text-lg leading-9 text-[#DDD4C5]">
          {uyuniChapterVerbatim}
        </pre>

        <div className="mt-8 rounded-2xl border border-[#D4AF37]/25 bg-[#17151D] p-5 text-sm leading-7 text-[#CFC7B8]">
          <pre className="whitespace-pre-wrap">{`> Objetos con aura.
> Hecho en Bolivia. Destinado al mundo.
> Atelier privado — por invitación.
> *Aura Preserve — fundado por Vuelo de Uyuni, by V.*`}</pre>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/auth"
            className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-6 py-2 text-xs uppercase tracking-[0.2em] text-[#F6E7B8]"
          >
            Solicitar acceso privado
          </Link>
          <Link
            href="/by-appointment"
            className="rounded-full border border-[#D4AF37]/35 px-6 py-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37]"
          >
            By appointment
          </Link>
        </div>
      </section>
    </main>
  );
}

