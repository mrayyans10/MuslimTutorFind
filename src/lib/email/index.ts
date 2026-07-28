type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Transactional email via Resend.
 * When RESEND_API_KEY is unset, messages are logged to the console (demo mode).
 */
export async function sendEmail(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Community Tutors <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[demo-email]", { from, ...input });
    return { id: "demo-email", demo: true as const };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  return result;
}
