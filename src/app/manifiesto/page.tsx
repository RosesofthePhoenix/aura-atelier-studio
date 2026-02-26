import Link from "next/link";
import {
  corePhilosophyVerbatim,
  emotionalPromiseVerbatim,
  masterplanDocumentTitle,
  masterplanSourceFile,
} from "@/content/masterplan";

export default function ManifiestoPage() {
  return (
    <main className="min-h-screen px-6 py-10 md:px-10">
      <header className="mx-auto w-full max-w-5xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[#D4AF37]/85">Manifiesto</p>
        <h1 className="mt-3 text-4xl text-[#F6E7B8] md:text-5xl">
          {masterplanDocumentTitle}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#CFC7B8]">
          Fuente canónica: {masterplanSourceFile}
        </p>
      </header>

      <section className="mx-auto mt-10 grid w-full max-w-5xl gap-4">
        <article className="rounded-2xl aura-surface p-6">
          <h2 className="text-2xl text-[#F5EFE3]">Core Philosophy (verbatim)</h2>
          <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#CFC7B8]">
            {corePhilosophyVerbatim}
          </pre>
        </article>
      </section>

      <section className="mx-auto mt-6 w-full max-w-5xl rounded-2xl aura-surface p-6">
        <h2 className="text-2xl text-[#F5EFE3]">Emotional Promise (verbatim)</h2>
        <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#D8D2C4]">
          {emotionalPromiseVerbatim}
        </pre>
        <Link href="/auth" className="mt-6 inline-flex rounded-full border border-[#D4AF37]/40 px-6 py-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
          Entrar al Ritual
        </Link>
      </section>
    </main>
  );
}

