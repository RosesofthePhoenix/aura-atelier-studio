interface SendInitiationAlertInput {
  recipient: string;
  identifier: string;
  initiationId: string;
}

export async function sendInitiationAlert({
  recipient,
  identifier,
  initiationId,
}: SendInitiationAlertInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error(
      "Missing RESEND_API_KEY or RESEND_FROM_EMAIL environment variables.",
    );
  }

  const subject = `Nueva Iniciación – ${identifier}`;
  const body = `
    <div style="font-family: Inter, Arial, sans-serif; color: #0F0F0F;">
      <h2>Nueva Iniciación recibida</h2>
      <p><strong>Identificador:</strong> ${identifier}</p>
      <p><strong>ID:</strong> ${initiationId}</p>
      <p>Revisa en tu bóveda privada: <a href="${process.env.NEXT_PUBLIC_SITE_URL}/val-vault/${initiationId}">abrir iniciación</a></p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      subject,
      html: body,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send alert email: ${errorText}`);
  }
}

