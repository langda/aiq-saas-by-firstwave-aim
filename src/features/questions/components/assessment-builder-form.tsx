"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Result } from "@/lib/result";
import { strings } from "@/lib/strings";

import { saveAssessmentBuilder } from "../server/actions";

export function AssessmentBuilderForm({
  assessment,
  published,
  selectedIds,
}: {
  assessment: {
    id: string;
    title: string;
    description: string;
    question_count: number;
    settings: unknown;
  };
  published: Array<{ id: string; title: string }>;
  selectedIds: string[];
}) {
  const [state, formAction, pending] = useActionState<
    Result<null> | null,
    FormData
  >(saveAssessmentBuilder, null);
  const s = strings.admin.builder;
  const settings =
    (assessment.settings as { retakeCooldownDays?: number }) ?? {};
  const selected = new Set(selectedIds);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <input type="hidden" name="id" value={assessment.id} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">{s.assessmentTitle}</Label>
        <Input
          id="title"
          name="title"
          defaultValue={assessment.title}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">{strings.admin.common.description}</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={assessment.description}
          rows={2}
        />
      </div>
      <div className="flex gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="questionCount">{s.questionCount}</Label>
          <Input
            id="questionCount"
            name="questionCount"
            type="number"
            min={1}
            max={60}
            className="w-28"
            defaultValue={assessment.question_count}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="retakeCooldownDays">{s.cooldown}</Label>
          <Input
            id="retakeCooldownDays"
            name="retakeCooldownDays"
            type="number"
            min={0}
            max={365}
            className="w-28"
            defaultValue={settings.retakeCooldownDays ?? 30}
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">{s.questionsLegend}</legend>
        {published.map((question) => (
          <label key={question.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="questionIds"
              value={question.id}
              defaultChecked={selected.has(question.id)}
              className="accent-primary size-4"
            />
            {question.title}
          </label>
        ))}
        {published.length === 0 && (
          <p className="text-muted-foreground text-sm">
            {strings.admin.common.empty}
          </p>
        )}
      </fieldset>

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
          {strings.admin.common.saved}
        </p>
      )}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? strings.admin.common.saving : strings.admin.common.save}
        </Button>
      </div>
    </form>
  );
}
