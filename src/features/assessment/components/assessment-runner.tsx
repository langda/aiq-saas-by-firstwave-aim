"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { strings } from "@/lib/strings";

import { saveAnswer, submitAssessment } from "../server/actions";
import type { RunnerState } from "../types";

/**
 * Walking-skeleton runner (Milestone 1): one question per screen, autosave on
 * select, submit at the end. Typeform-grade polish arrives in Milestone 3 —
 * the data flow here is already final.
 */
export function AssessmentRunner({ state }: { state: RunnerState }) {
  const { sessionId, questions } = state;
  const [answers, setAnswers] = useState(state.answers);
  const firstUnanswered = useMemo(
    () => questions.findIndex((q) => !answers[q.id]),
    // Initial position only — navigation is user-driven afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [index, setIndex] = useState(
    firstUnanswered === -1 ? 0 : firstUnanswered,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Set in an effect (render must stay pure): when the question changes,
  // restart the per-question timer.
  const questionShownAt = useRef(0);
  useEffect(() => {
    questionShownAt.current = Date.now();
  }, [index]);

  const question = questions[index];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.every((q) => answers[q.id]);

  function choose(optionId: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    setError(null);
    startTransition(async () => {
      const result = await saveAnswer({
        sessionId,
        questionId: question.id,
        optionId,
        timeSpentMs: Date.now() - questionShownAt.current,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      if (index < questions.length - 1) {
        setIndex(index + 1);
        questionShownAt.current = Date.now();
      }
    });
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await submitAssessment({ sessionId });
      // On success the action redirects; reaching here means failure.
      if (result && !result.ok) setError(result.error.message);
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <p className="text-muted-foreground text-sm" aria-live="polite">
        {index + 1} / {questions.length}
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{question.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="text-muted-foreground">{question.scenario}</p>
          <div
            role="radiogroup"
            aria-label={question.title}
            className="flex flex-col gap-3"
          >
            {question.options.map((option) => {
              const selected = answers[question.id] === option.id;
              return (
                <button
                  key={option.id}
                  role="radio"
                  aria-checked={selected}
                  disabled={pending}
                  onClick={() => choose(option.id)}
                  className={`rounded-lg border p-4 text-left text-sm transition-colors ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted border-border"
                  }`}
                >
                  {option.content}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          disabled={index === 0 || pending}
          onClick={() => setIndex(index - 1)}
        >
          {strings.runner.back}
        </Button>
        {allAnswered ? (
          <Button onClick={submit} disabled={pending}>
            {pending ? "…" : strings.runner.submit}
          </Button>
        ) : (
          <span className="text-muted-foreground text-sm">
            {answeredCount} / {questions.length} {strings.runner.answered}
          </span>
        )}
      </div>
    </div>
  );
}
