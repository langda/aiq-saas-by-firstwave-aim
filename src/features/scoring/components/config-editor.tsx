"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Result } from "@/lib/result";
import { strings } from "@/lib/strings";

import { saveScoringDraft } from "../server/actions";

/** New-version editor: paste/edit JSON, validated server-side by the engine
 *  schema before anything is stored. Configs are immutable — this always
 *  creates the next version as a draft. */
export function ConfigEditor({ initialJson }: { initialJson: string }) {
  const [state, formAction, pending] = useActionState<
    Result<{ version: number }> | null,
    FormData
  >(saveScoringDraft, null);
  const s = strings.admin.scoring;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Textarea
        name="config"
        defaultValue={initialJson}
        rows={18}
        spellCheck={false}
        className="font-mono text-xs"
        aria-label={s.editorLabel}
      />
      {state && !state.ok && (
        <p role="alert" className="text-destructive text-sm">
          {state.error.message}
        </p>
      )}
      {state?.ok && (
        <p
          role="status"
          className="text-sm text-emerald-600 dark:text-emerald-400"
        >
          {s.draftSaved} v{state.data.version}
        </p>
      )}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? strings.admin.common.saving : s.saveDraft}
        </Button>
      </div>
    </form>
  );
}
