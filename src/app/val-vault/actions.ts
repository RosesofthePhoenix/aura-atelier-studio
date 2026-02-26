"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isValAllowlisted } from "@/lib/auth/guards";
import { isPassphraseValid, setVaultPassphraseCookie } from "@/lib/auth/passphrase";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AuraVaultStatus } from "@/types/initiation";

const statusSchema = z.enum(["nueva", "en_lectura", "tejiendo", "completada"]);

export async function unlockValVaultAction(formData: FormData) {
  const passphrase = String(formData.get("passphrase") ?? "");

  if (!isPassphraseValid(passphrase)) {
    redirect("/val-vault/unlock?error=1");
  }

  await setVaultPassphraseCookie();
  redirect("/val-vault");
}

export async function updateInitiationStatusAction(
  initiationId: string,
  status: AuraVaultStatus,
) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isValAllowlisted(user.email))) {
    throw new Error("Unauthorized");
  }

  const parsedStatus = statusSchema.parse(status);
  const { error } = await supabase
    .from("aura_initiations")
    .update({ status: parsedStatus })
    .eq("id", initiationId);

  if (error) {
    throw error;
  }

  revalidatePath("/val-vault");
  revalidatePath(`/val-vault/${initiationId}`);
}

