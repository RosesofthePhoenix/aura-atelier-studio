import { KeyRound } from "lucide-react";
import { unlockValVaultAction } from "@/app/val-vault/actions";

interface UnlockPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function ValVaultUnlockPage({ searchParams }: UnlockPageProps) {
  const params = await searchParams;
  const hasError = params.error === "1";

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-3xl aura-surface p-8">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#D4AF37]/85">
          <KeyRound className="h-4 w-4" />
          Val-only Vault Gate
        </p>
        <h1 className="mt-4 text-3xl text-[#F6E7B8]">Contraseña ritual</h1>
        <p className="mt-3 text-sm leading-7 text-[#D8D2C4]">
          Segunda capa de protección para la bóveda privada.
        </p>

        <form action={unlockValVaultAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#D4AF37]/85">
              Passphrase
            </span>
            <input
              required
              type="password"
              name="passphrase"
              className="w-full rounded-xl border border-[#D4AF37]/30 bg-[#17151D] px-4 py-3 text-sm text-[#F5EFE3] outline-none"
            />
          </label>
          <button
            type="submit"
            className="inline-flex rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/10 px-6 py-2 text-xs uppercase tracking-[0.2em] text-[#F6E7B8]"
          >
            Unlock Vault
          </button>
        </form>

        {hasError ? (
          <p className="mt-4 text-xs text-[#C45A3A]">
            Passphrase inválida. Intenta nuevamente.
          </p>
        ) : null}
      </section>
    </main>
  );
}

