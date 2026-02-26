import { NextResponse, type NextRequest } from "next/server";
import { getVaultCookieName } from "@/lib/auth/guards";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const VAULT_UNLOCK_PATH = "/val-vault/unlock";

function isPathProtected(pathname: string) {
  return pathname.startsWith("/iniciacion") || pathname.startsWith("/val-vault");
}

function isValEmail(email?: string | null) {
  if (!email) {
    return false;
  }
  const allowlist = process.env.VAL_VAULT_ALLOWLIST_EMAILS ?? "";
  const normalized = allowlist
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return normalized.includes(email.toLowerCase());
}

export async function middleware(request: NextRequest) {
  if (!isPathProtected(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const { supabase, response } = updateSupabaseSession(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (request.nextUrl.pathname.startsWith("/val-vault")) {
    if (!isValEmail(user.email)) {
      return NextResponse.redirect(new URL("/auth/error", request.url));
    }

    if (
      request.nextUrl.pathname !== VAULT_UNLOCK_PATH &&
      request.cookies.get(getVaultCookieName())?.value !== "true"
    ) {
      return NextResponse.redirect(new URL(VAULT_UNLOCK_PATH, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/iniciacion/:path*", "/val-vault/:path*"],
};

