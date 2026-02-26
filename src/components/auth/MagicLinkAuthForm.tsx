"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail, Sparkles } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { RitualButton } from "@/components/ui/RitualButton";

interface MagicLinkAuthFormProps {
  nextPath: string;
}

export function MagicLinkAuthForm({ nextPath }: MagicLinkAuthFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectBase =
        process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const redirectTo = `${redirectBase}/auth/callback?next=${encodeURIComponent(nextPath)}`;

      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (authError) {
        throw authError;
      }

      setNotice(
        "Te enviamos un enlace mágico. Ábrelo desde tu email para entrar al atelier privado.",
      );
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo enviar el magic link.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative z-10 w-full max-w-xl rounded-3xl aura-surface p-8 md:p-12">
      <p className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#D4AF37]/85">
        <Sparkles className="h-4 w-4" />
        Private Atelier Access
      </p>
      <h1 className="text-4xl leading-tight text-[#F6E7B8]">
        Acceso por enlace mágico
      </h1>
      <p className="mt-4 text-sm leading-7 text-[#D8D2C4]">
        Aura Atelier abre por invitación. Escribe tu email para recibir el
        ingreso ritual.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#D4AF37]/90">
            Email
          </span>
          <div className="flex items-center gap-3 rounded-2xl border border-[#D4AF37]/30 bg-[#18161E] px-4 py-3">
            <Mail className="h-4 w-4 text-[#D4AF37]/80" />
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent text-sm text-[#F5EFE3] outline-none placeholder:text-[#8A8073]"
            />
          </div>
        </label>

        <RitualButton type="submit" disabled={loading || !email}>
          {loading ? "Invocando enlace..." : "Enviar enlace mágico"}
        </RitualButton>
      </form>

      {notice ? <p className="mt-5 text-sm text-[#D4AF37]">{notice}</p> : null}
      {error ? <p className="mt-5 text-sm text-[#C45A3A]">{error}</p> : null}

      <Link href="/" className="gold-link mt-8 inline-flex text-xs uppercase tracking-[0.2em]">
        Volver al Atelier
      </Link>
    </div>
  );
}

