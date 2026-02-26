import { NextResponse } from "next/server";
import { sendInitiationAlert } from "@/lib/notifications/email";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      initiationId?: string;
      identifier?: string;
    };

    if (!body.initiationId) {
      return NextResponse.json({ error: "Missing initiationId" }, { status: 400 });
    }

    const { data: initiation, error } = await supabase
      .from("aura_initiations")
      .select("id, user_id, email, instagram_handle")
      .eq("id", body.initiationId)
      .maybeSingle();

    if (error || !initiation || initiation.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const recipient = process.env.VAL_ALERT_EMAIL;
    if (!recipient) {
      return NextResponse.json(
        { error: "VAL_ALERT_EMAIL is not configured." },
        { status: 500 },
      );
    }

    const identifier =
      body.identifier || initiation.instagram_handle || initiation.email;

    await sendInitiationAlert({
      recipient,
      identifier,
      initiationId: initiation.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

