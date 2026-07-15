import "server-only";

import { Resend } from "resend";

import { serverEnv } from "@/lib/env.server";

/**
 * Transactional email adapter — Resend (founder decision, 2026-07-15; closes
 * OPEN_QUESTIONS F). Same adapter discipline as lib/ai: callers use this
 * interface, never the provider SDK. Without RESEND_API_KEY the adapter is a
 * silent no-op — email is an enhancement, never a flow dependency.
 */

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
};

export function isEmailConfigured(): boolean {
  return !!serverEnv.RESEND_API_KEY;
}

export async function sendEmail(message: EmailMessage): Promise<boolean> {
  if (!serverEnv.RESEND_API_KEY) return false;
  try {
    const resend = new Resend(serverEnv.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: serverEnv.EMAIL_FROM ?? "AIQ <onboarding@resend.dev>",
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
    if (error) {
      console.error("email send failed", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("email send failed", error);
    return false;
  }
}
