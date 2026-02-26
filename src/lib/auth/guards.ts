import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const vaultCookieName = "aura_val_vault_passphrase_ok";

export async function requireAuthenticatedUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/iniciacion");
  }

  return user;
}

export function getVaultCookieName() {
  return vaultCookieName;
}

export async function isValAllowlisted(email?: string | null) {
  if (!email) {
    return false;
  }

  const allowlist = process.env.VAL_VAULT_ALLOWLIST_EMAILS ?? "";
  return allowlist
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

export async function hasValVaultPassphraseCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(vaultCookieName)?.value === "true";
}

