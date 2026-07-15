"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { strings } from "@/lib/strings";

import { publishQuestion, saveQuestion } from "../server/actions";

type CompetencyRef = { slug: string; name: string };

type SignalDraft = { competencySlug: string; weight: number };
type OptionDraft = { id?: string; content: string; signals: SignalDraft[] };

export type QuestionDraft = {
  id?: string;
  title: string;
  scenario: string;
  difficulty: number;
  industryTags: string[];
  status?: string;
  locked?: boolean; // has recorded responses (§4.5) — read-only
  options: OptionDraft[];
};

const emptyOption = (): OptionDraft => ({ content: "", signals: [] });

export function QuestionForm({
  draft,
  competencies,
}: {
  draft: QuestionDraft;
  competencies: CompetencyRef[];
}) {
  const router = useRouter();
  const s = strings.admin.questions;
  const c = strings.admin.common;
  const [question, setQuestion] = useState(draft);
  const [message, setMessage] = useState<{
    kind: "error" | "success" | "warnings";
    lines: string[];
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const disabled = !!draft.locked || pending;

  function patchOption(index: number, patch: Partial<OptionDraft>) {
    setQuestion((q) => ({
      ...q,
      options: q.options.map((o, i) => (i === index ? { ...o, ...patch } : o)),
    }));
  }

  function save(thenPublish: boolean) {
    setMessage(null);
    startTransition(async () => {
      const result = await saveQuestion({
        ...question,
        industryTags: question.industryTags.filter(Boolean),
      });
      if (!result.ok) {
        setMessage({ kind: "error", lines: [result.error.message] });
        return;
      }
      if (thenPublish) {
        const published = await publishQuestion({ id: result.data.id });
        if (!published.ok) {
          setMessage({ kind: "error", lines: [published.error.message] });
          return;
        }
        if (published.data.errors.length > 0) {
          setMessage({
            kind: "error",
            lines: [s.publishBlocked, ...published.data.errors],
          });
          router.replace(`/admin/questions/${result.data.id}`);
          return;
        }
        setMessage({
          kind: published.data.warnings.length > 0 ? "warnings" : "success",
          lines:
            published.data.warnings.length > 0
              ? [s.publishWarnings, ...published.data.warnings]
              : [s.published],
        });
      } else {
        setMessage({ kind: "success", lines: [c.saved] });
      }
      router.replace(`/admin/questions/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {draft.locked && (
        <p className="border-destructive/40 text-destructive rounded-lg border p-3 text-sm">
          {s.immutableNote}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="q-title">{s.questionTitle}</Label>
        <Input
          id="q-title"
          value={question.title}
          disabled={disabled}
          onChange={(e) => setQuestion({ ...question, title: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="q-scenario">{s.scenario}</Label>
        <Textarea
          id="q-scenario"
          rows={3}
          value={question.scenario}
          disabled={disabled}
          onChange={(e) =>
            setQuestion({ ...question, scenario: e.target.value })
          }
        />
      </div>
      <div className="flex gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="q-difficulty">{s.difficulty}</Label>
          <Input
            id="q-difficulty"
            type="number"
            min={1}
            max={5}
            className="w-24"
            value={question.difficulty}
            disabled={disabled}
            onChange={(e) =>
              setQuestion({
                ...question,
                difficulty: Number(e.target.value) || 1,
              })
            }
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="q-tags">{s.tags}</Label>
          <Input
            id="q-tags"
            value={question.industryTags.join(", ")}
            disabled={disabled}
            onChange={(e) =>
              setQuestion({
                ...question,
                industryTags: e.target.value.split(",").map((t) => t.trim()),
              })
            }
          />
        </div>
      </div>

      <h2 className="text-lg font-semibold">{s.options}</h2>
      {question.options.map((option, optionIndex) => (
        <Card key={option.id ?? `new-${optionIndex}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {s.optionContent} {optionIndex + 1}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled || question.options.length <= 2}
              onClick={() =>
                setQuestion((q) => ({
                  ...q,
                  options: q.options.filter((_, i) => i !== optionIndex),
                }))
              }
            >
              {s.removeOption}
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Textarea
              rows={2}
              value={option.content}
              disabled={disabled}
              onChange={(e) =>
                patchOption(optionIndex, { content: e.target.value })
              }
              aria-label={`${s.optionContent} ${optionIndex + 1}`}
            />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">{s.signals}</span>
              {option.signals.map((signal, signalIndex) => (
                <div key={signalIndex} className="flex items-center gap-2">
                  <select
                    className="border-input bg-background h-8 flex-1 rounded-md border px-2 text-sm"
                    value={signal.competencySlug}
                    disabled={disabled}
                    aria-label={s.competency}
                    onChange={(e) =>
                      patchOption(optionIndex, {
                        signals: option.signals.map((sig, i) =>
                          i === signalIndex
                            ? { ...sig, competencySlug: e.target.value }
                            : sig,
                        ),
                      })
                    }
                  >
                    {competencies.map((comp) => (
                      <option key={comp.slug} value={comp.slug}>
                        {comp.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    step={0.5}
                    min={0.5}
                    max={3}
                    className="w-24"
                    value={signal.weight}
                    disabled={disabled}
                    aria-label={s.weight}
                    onChange={(e) =>
                      patchOption(optionIndex, {
                        signals: option.signals.map((sig, i) =>
                          i === signalIndex
                            ? { ...sig, weight: Number(e.target.value) || 0.5 }
                            : sig,
                        ),
                      })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={() =>
                      patchOption(optionIndex, {
                        signals: option.signals.filter(
                          (_, i) => i !== signalIndex,
                        ),
                      })
                    }
                  >
                    {s.removeSignal}
                  </Button>
                </div>
              ))}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={disabled || option.signals.length >= 3}
                  onClick={() =>
                    patchOption(optionIndex, {
                      signals: [
                        ...option.signals,
                        {
                          competencySlug: competencies[0]?.slug ?? "",
                          weight: 1,
                        },
                      ],
                    })
                  }
                >
                  {s.addSignal}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div>
        <Button
          variant="outline"
          disabled={disabled || question.options.length >= 4}
          onClick={() =>
            setQuestion((q) => ({
              ...q,
              options: [...q.options, emptyOption()],
            }))
          }
        >
          {s.addOption}
        </Button>
      </div>

      {message && (
        <div
          role={message.kind === "error" ? "alert" : "status"}
          className={`rounded-lg border p-3 text-sm ${
            message.kind === "error"
              ? "border-destructive/40 text-destructive"
              : message.kind === "warnings"
                ? "border-amber-400/60 text-amber-700 dark:text-amber-400"
                : "border-emerald-400/60 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {message.lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={() => save(false)} disabled={disabled}>
          {pending ? c.saving : c.save}
        </Button>
        {question.status !== "published" && (
          <Button
            variant="outline"
            onClick={() => save(true)}
            disabled={disabled}
          >
            {c.publish}
          </Button>
        )}
      </div>
    </div>
  );
}
