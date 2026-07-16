"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { strings } from "@/lib/strings";

/**
 * The anticipation beat (UX_REVIEW §4): a full-screen takeover between the
 * final answer and the persona reveal. Staged lines build suspense while
 * scoring runs server-side. Unmounts when navigation lands on results.
 */
export function RevealOverlay() {
  const reduceMotion = useReducedMotion();
  const lines = strings.reveal.stages;
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage >= lines.length - 1) return;
    const timer = setTimeout(() => setStage((s) => s + 1), 950);
    return () => clearTimeout(timer);
  }, [stage, lines.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.3 }}
      className="bg-background fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"
      role="status"
      aria-live="polite"
    >
      <motion.div
        aria-hidden
        className="from-primary/30 to-primary size-16 rounded-2xl bg-gradient-to-br shadow-lg"
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.12, 1], rotate: [0, 4, -4, 0] }
        }
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <AnimatePresence mode="wait">
        <motion.p
          key={stage}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="text-xl font-medium tracking-tight"
        >
          {lines[stage]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}
