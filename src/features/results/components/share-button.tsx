"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

/**
 * Hero share action (sharing is first-class — UX_PHILOSOPHY). Native share
 * sheet where available; copy-link everywhere else. Shares the public verify
 * URL: identity only, never analytics (Decision 6).
 */
export function ShareButton({
  verifyCode,
  personaName,
}: {
  verifyCode: string | null;
  personaName: string;
}) {
  const [copied, setCopied] = useState(false);
  const s = strings.share;
  if (!verifyCode) return null;

  async function share() {
    const url = `${window.location.origin}/verify/${verifyCode}`;
    const text = s.message.replace("{persona}", personaName);
    if (navigator.share) {
      try {
        await navigator.share({ title: "AIQ", text, url });
        return;
      } catch {
        // user dismissed the sheet — nothing to do
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <Button size="lg" onClick={share}>
      {copied ? s.copied : s.action}
    </Button>
  );
}
