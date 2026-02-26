import { IniciacionRitual } from "@/components/iniciacion/IniciacionRitual";
import { requireAuthenticatedUser } from "@/lib/auth/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { InitiationAnswer } from "@/types/initiation";

export default async function IniciacionPage() {
  const user = await requireAuthenticatedUser();
  const supabase = await getSupabaseServerClient();

  const { data: draft } = await supabase
    .from("aura_initiations")
    .select("*")
    .eq("user_id", user.id)
    .eq("draft", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let assets: Array<{
    questionId: string;
    assetType: "voice" | "photo";
    storagePath: string;
  }> = [];

  if (draft?.id) {
    const { data: assetsData } = await supabase
      .from("aura_initiation_assets")
      .select("question_id, asset_type, storage_path")
      .eq("initiation_id", draft.id);

    assets =
      assetsData?.map((asset) => ({
        questionId: asset.question_id as string,
        assetType: asset.asset_type as "voice" | "photo",
        storagePath: asset.storage_path as string,
      })) ?? [];
  }

  const answers =
    ((draft?.answers as InitiationAnswer[] | undefined) ?? []).reduce<
      Record<string, string>
    >((acc, item) => {
      acc[item.id] = item.value;
      return acc;
    }, {});

  return (
    <main className="min-h-screen">
      <IniciacionRitual
        userId={user.id}
        userEmail={user.email ?? ""}
        initialDraft={{
          initiationId: draft?.id ?? null,
          email: draft?.email ?? user.email ?? "",
          instagram_handle: draft?.instagram_handle ?? "",
          answers,
          lastStep: draft?.last_step ?? 0,
          assets,
        }}
      />
    </main>
  );
}

