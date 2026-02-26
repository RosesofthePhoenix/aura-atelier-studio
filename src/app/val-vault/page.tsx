import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Flame, Layers, Mail, Sparkles } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { updateInitiationStatusAction } from "@/app/val-vault/actions";
import { hasValVaultPassphraseCookie, isValAllowlisted } from "@/lib/auth/guards";
import { formatDisplayDate } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AuraVaultStatus } from "@/types/initiation";

const vaultColumns: Array<{ status: AuraVaultStatus; label: string }> = [
  { status: "nueva", label: "Nueva" },
  { status: "en_lectura", label: "En Lectura" },
  { status: "tejiendo", label: "Tejiendo" },
  { status: "completada", label: "Completada" },
];

export default async function ValVaultPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/val-vault");
  }

  if (!(await isValAllowlisted(user.email))) {
    redirect("/auth/error");
  }

  if (!(await hasValVaultPassphraseCookie())) {
    redirect("/val-vault/unlock");
  }

  const { data: initiations } = await supabase
    .from("aura_initiations")
    .select(
      "id, email, instagram_handle, status, piece_recommendation, energy_intensity, submitted_at, created_at",
    )
    .eq("draft", false)
    .order("submitted_at", { ascending: false, nullsFirst: false });

  const records = initiations ?? [];

  return (
    <main className="min-h-screen px-5 py-8 md:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#D4AF37]/85">
            Val-only Results Vault
          </p>
          <h1 className="mt-2 text-3xl text-[#F6E7B8] md:text-4xl">Bóveda de Iniciaciones</h1>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-full border border-[#D4AF37]/40 px-5 py-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37]"
          >
            Cerrar sesión
          </button>
        </form>
      </header>

      <section className="grid gap-4 lg:grid-cols-4">
        {vaultColumns.map((column) => (
          <article key={column.status} className="rounded-3xl aura-surface p-4">
            <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-[#D4AF37]/90">
              {column.label}
            </h2>

            <div className="space-y-3">
              {records
                .filter((item) => item.status === column.status)
                .map((item) => (
                  <div
                    key={item.id}
                    className="space-y-3 rounded-2xl border border-[#D4AF37]/28 bg-[#17151D] p-3"
                  >
                    <div className="space-y-2">
                      <p className="inline-flex items-center gap-1 text-xs text-[#D4AF37]/90">
                        <Mail className="h-3.5 w-3.5" />
                        {item.instagram_handle || item.email}
                      </p>
                      <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-[#C7BFAE]">
                        <Layers className="h-3.5 w-3.5" />
                        {item.piece_recommendation || "Sin sugerencia"}
                      </p>
                      <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-[#C7BFAE]">
                        <Flame className="h-3.5 w-3.5" />
                        Intensidad {item.energy_intensity ?? "-"}
                      </p>
                      <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-[#C7BFAE]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDisplayDate(item.submitted_at ?? item.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {vaultColumns.map((target) => (
                        <form
                          key={target.status}
                          action={updateInitiationStatusAction.bind(
                            null,
                            item.id,
                            target.status,
                          )}
                        >
                          <button
                            type="submit"
                            className="rounded-full border border-[#D4AF37]/30 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#D4AF37]/90"
                          >
                            {target.label}
                          </button>
                        </form>
                      ))}
                    </div>

                    <Link
                      href={`/val-vault/${item.id}`}
                      className="inline-flex items-center gap-1 text-xs text-[#EAD087] underline-offset-4 hover:underline"
                    >
                      <Sparkles className="h-3 w-3" />
                      Abrir detalle
                    </Link>
                  </div>
                ))}

              {records.filter((item) => item.status === column.status).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D4AF37]/20 p-4 text-xs text-[#8D8477]">
                  Sin iniciaciones en esta columna.
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

