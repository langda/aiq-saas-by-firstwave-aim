"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export function CertificateActions({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const s = strings.certificate;

  async function copyLink() {
    await navigator.clipboard.writeText(
      `${window.location.origin}/verify/${code}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Button
          nativeButton={false}
          render={<a href={`/api/certificates/${code}/pdf`} />}
        >
          {s.download}
        </Button>
        <Button variant="outline" onClick={copyLink}>
          {copied ? s.copied : s.copyLink}
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <a
              href={`/api/share/story/${code}`}
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          {s.storyImage}
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">{s.shareHint}</p>
    </div>
  );
}
