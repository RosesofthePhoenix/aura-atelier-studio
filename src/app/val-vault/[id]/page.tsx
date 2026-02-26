import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Flame, Layers } from "lucide-react";
import { hasValVaultPassphraseCookie, isValAllowlisted } from "@/lib/auth/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDisplayDate } from "@/lib/utils";
import type { InitiationAnswer } from "@/types/initiation";

interface ValVaultDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ValVaultDetailPage({ params }: ValVaultDetailPageProps) {
  const { id } = await params;
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

  const { data: initiation } = await supabase
    .from("aura_initiations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!initiation) {
    notFound();
  }

  const { data: assets } = await supabase
    .from("aura_initiation_assets")
    .select("*")
    .eq("initiation_id", id)
    .order("created_at", { ascending: true });

  const answers = (initiation.answers as InitiationAnswer[] | null) ?? [];
  const voiceAssets = (assets ?? []).filter((asset) => asset.asset_type === "voice");
  const photoAssets = (assets ?? []).filter((asset) => asset.asset_type === "photo");

  const signedVoice = await Promise.all(
    voiceAssets.map(async (asset) => {
      const { data } = await supabase.storage
        .from("initiation-voice-notes")
        .createSignedUrl(asset.storage_path as string, 60 * 60);
      return {
        ...asset,
        url: data?.signedUrl ?? null,
      };
    }),
  );

  const signedPhotos = await Promise.all(
    photoAssets.map(async (asset) => {
      const { data } = await supabase.storage
        .from("initiation-photos")
        .createSignedUrl(asset.storage_path as string, 60 * 60);
      return {
        ...asset,
        url: data?.signedUrl ?? null,
      };
    }),
  );

  return (
    <main className="min-h-screen px-5 py-8 md:px-10">
      <Link
        href="/val-vault"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37]"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a bóveda
      </Link>

      <section className="rounded-3xl aura-surface p-6 md:p-10">
        <h1 className="text-3xl text-[#F6E7B8]">Detalle de Iniciación</h1>
        <p className="mt-2 text-sm text-[#CFC7B8]">
          {initiation.instagram_handle || initiation.email} ·{" "}
          {formatDisplayDate(initiation.submitted_at ?? initiation.created_at)}
        </p>

        <div className="mt-5 flex flex-wrap gap-4 text-xs uppercase tracking-[0.2em]">
          <p className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/35 px-3 py-1 text-[#D4AF37]">
            <Layers className="h-3.5 w-3.5" />
            {initiation.piece_recommendation || "Sin recomendación"}
          </p>
          <p className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/35 px-3 py-1 text-[#D4AF37]">
            <Flame className="h-3.5 w-3.5" />
            Intensidad {initiation.energy_intensity ?? "-"}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="space-y-3">
            <h2 className="text-lg text-[#F5EFE3]">Respuestas rituales</h2>
            {answers.map((answer) => (
              <div
                key={answer.id}
                className="rounded-2xl border border-[#D4AF37]/25 bg-[#17151D] p-4"
              >
                <p className="text-sm leading-7 text-[#E6DCC6]">{answer.label}</p>
                <p className="mt-2 text-sm leading-7 text-[#CFC7B8]">
                  {answer.value || "Sin respuesta"}
                </p>
              </div>
            ))}
          </article>

          <article className="space-y-6">
            <div>
              <h2 className="mb-3 text-lg text-[#F5EFE3]">Voz</h2>
              <div className="space-y-2">
                {signedVoice.length === 0 ? (
                  <p className="text-sm text-[#8D8477]">Sin notas de voz.</p>
                ) : (
                  signedVoice.map((asset) => (
                    <div
                      key={asset.id}
                      className="rounded-2xl border border-[#D4AF37]/25 bg-[#17151D] p-3"
                    >
                      <p className="mb-2 text-xs text-[#D4AF37]/85">
                        {asset.question_id}
                      </p>
                      {asset.url ? (
                        <audio controls preload="none" className="w-full">
                          <source src={asset.url} type={asset.mime_type as string} />
                        </audio>
                      ) : (
                        <p className="text-xs text-[#8D8477]">No disponible</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-lg text-[#F5EFE3]">Fotos</h2>
              <div className="grid grid-cols-2 gap-3">
                {signedPhotos.length === 0 ? (
                  <p className="col-span-2 text-sm text-[#8D8477]">Sin fotos.</p>
                ) : (
                  signedPhotos.map((asset) => (
                    <div
                      key={asset.id}
                      className="overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-[#17151D]"
                    >
                      {asset.url ? (
                        <Image
                          src={asset.url}
                          alt={asset.question_id as string}
                          width={480}
                          height={280}
                          unoptimized
                          className="h-36 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-36 items-center justify-center text-xs text-[#8D8477]">
                          No disponible
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

