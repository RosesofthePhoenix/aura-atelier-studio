import Link from "next/link";
import { byAppointmentVerbatim } from "@/content/masterplan";

export default function ByAppointmentPage() {
  return (
    <main className="min-h-screen px-6 py-10 md:px-10">
      <section className="mx-auto w-full max-w-4xl rounded-3xl aura-surface p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.22em] text-[#D4AF37]/85">
          Atelier Experience
        </p>
        <h1 className="mt-3 text-4xl text-[#F6E7B8] md:text-5xl">By Appointment</h1>
        <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#D8D2C4]">
          {byAppointmentVerbatim}
        </pre>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/auth"
            className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-6 py-2 text-xs uppercase tracking-[0.2em] text-[#F6E7B8]"
          >
            Empezar iniciación
          </Link>
          <Link
            href="/manifiesto"
            className="rounded-full border border-[#D4AF37]/35 px-6 py-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37]"
          >
            Ver manifiesto
          </Link>
        </div>
      </section>
    </main>
  );
}

