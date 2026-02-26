import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="max-w-lg rounded-3xl aura-surface p-10 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-[#C45A3A]">
          Access denied
        </p>
        <h1 className="mt-4 text-4xl text-[#F5EFE3]">
          Esta puerta pertenece a Val
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#D8D2C4]">
          Tu sesión no está autorizada para la bóveda privada.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full border border-[#D4AF37]/45 px-6 py-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37]"
        >
          Volver al Atelier
        </Link>
      </section>
    </main>
  );
}

