"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

import { saveAnswer, submitAssessment } from "../server/actions";
import type { RunnerState } from "../types";
import { RevealOverlay } from "./reveal-overlay";

/**
 * The assessment runner (Milestone 3 polish): one question per screen,
 * Typeform-grade motion, autosave on select, keyboard 1–4 + arrows, focus
 * moved to each new question for screen readers, reduced-motion honored.
 */
export function AssessmentRunner({ state }: { state: RunnerState }) {
  const { sessionId, questions } = state;
  const s = strings.runner;
  const reduceMotion = useReducedMotion();
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
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [revealing, setRevealing] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const questionShownAt = useRef(0);

  useEffect(() => {
    questionShownAt.current = Date.now();
    headingRef.current?.focus({ preventScroll: false });
  }, [index]);

  const question = questions[index];
  const allAnswered = questions.every((q) => answers[q.id]);
  const progress = Object.keys(answers).length / questions.length;

  function goTo(next: number) {
    setDirection(next > index ? 1 : -1);
    setIndex(Math.max(0, Math.min(questions.length - 1, next)));
  }

  function choose(optionId: string) {
    if (pending) return;
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
      if (index < questions.length - 1) goTo(index + 1);
    });
  }

  function submit() {
    setError(null);
    setRevealing(true);
    startTransition(async () => {
      // Hold the anticipation beat (UX_REVIEW §4) BEFORE submitting — the
      // action's redirect navigates the moment it resolves, so the stage
      // sequence must play first.
      await new Promise((resolve) => setTimeout(resolve, 2400));
      const result = await submitAssessment({ sessionId });
      if (result && !result.ok) {
        setRevealing(false);
        setError(result.error.message);
      }
    });
  }

  // Keyboard: 1–4 select, arrows navigate.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const optionIndex = Number(event.key) - 1;
      if (optionIndex >= 0 && optionIndex < question.options.length) {
        choose(question.options[optionIndex].id);
      } else if (event.key === "ArrowLeft") {
        goTo(index - 1);
      } else if (event.key === "ArrowRight" && answers[question.id]) {
        goTo(index + 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, question, answers, pending]);

  const slide = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 48 * direction },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -48 * direction },
      };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8">
      {revealing && <RevealOverlay />}
      {/* Progress */}
      <div className="flex items-center gap-4">
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={s.progressLabel}
          className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full"
        >
          <motion.div
            className="bg-primary h-full rounded-full"
            initial={false}
            animate={{ width: `${Math.max(4, progress * 100)}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
          />
        </div>
        <p
          className="text-muted-foreground text-sm tabular-nums"
          aria-live="polite"
        >
          {index + 1} / {questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="relative flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={question.id}
            {...slide}
            transition={{
              duration: reduceMotion ? 0 : 0.28,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-3">
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-2xl font-semibold tracking-tight text-balance outline-none md:text-3xl"
              >
                {question.title}
              </h2>
              <p className="text-muted-foreground text-lg text-pretty">
                {question.scenario}
              </p>
            </div>

            <div
              role="radiogroup"
              aria-label={question.title}
              className="flex flex-col gap-3"
            >
              {question.options.map((option, optionIndex) => {
                const selected = answers[question.id] === option.id;
                return (
                  <motion.button
                    key={option.id}
                    role="radio"
                    aria-checked={selected}
                    disabled={pending}
                    onClick={() => choose(option.id)}
                    whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                    className={`group flex items-start gap-3 rounded-xl border p-4 text-left text-sm transition-all md:text-base ${
                      selected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground group-hover:border-primary/40"
                      }`}
                    >
                      {optionIndex + 1}
                    </span>
                    {option.content}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between pb-4">
        <Button
          variant="ghost"
          disabled={index === 0 || pending}
          onClick={() => goTo(index - 1)}
        >
          {s.back}
        </Button>
        <p className="text-muted-foreground hidden text-xs sm:block">
          {s.keyHint}
        </p>
        {allAnswered ? (
          <Button size="lg" onClick={submit} disabled={pending}>
            {pending ? "…" : s.submit}
          </Button>
        ) : (
          <Button
            variant="ghost"
            disabled={
              !answers[question.id] || index === questions.length - 1 || pending
            }
            onClick={() => goTo(index + 1)}
          >
            {s.next}
          </Button>
        )}
      </div>
    </div>
  );
}
