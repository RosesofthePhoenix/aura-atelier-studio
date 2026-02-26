import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getVaultCookieName } from "@/lib/auth/guards";

function toBuffer(value: string) {
  return Buffer.from(value, "utf8");
}

export function isPassphraseValid(input: string) {
  const expected = process.env.VAL_VAULT_PASSPHRASE ?? "";
  if (!expected || !input) {
    return false;
  }

  const a = toBuffer(input);
  const b = toBuffer(expected);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export async function setVaultPassphraseCookie() {
  const cookieStore = await cookies();
  cookieStore.set(getVaultCookieName(), "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

