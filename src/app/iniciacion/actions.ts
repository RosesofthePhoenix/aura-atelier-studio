"use server";

import { sendInitiationAlert } from "@/lib/notifications/email";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface NotifyValInput {
  initiationId: string;
  identifier: string;
}

export async function notifyValNewInitiationAction({
  initiationId,
  identifier,
}: NotifyValInput) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: initiation, error } = await supabase
    .from("aura_initiations")
    .select("id, user_id, email, instagram_handle")
    .eq("id", initiationId)
    .maybeSingle();

  if (error || !initiation || initiation.user_id !== user.id) {
    throw new Error("Forbidden");
  }

  const recipient = process.env.VAL_ALERT_EMAIL;
  if (!recipient) {
    throw new Error("VAL_ALERT_EMAIL is not configured.");
  }

  await sendInitiationAlert({
    recipient,
    identifier: identifier || initiation.instagram_handle || initiation.email,
    initiationId: initiation.id,
  });
}

