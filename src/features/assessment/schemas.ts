import { z } from "zod";

/** Shape of assessment_sessions.served_questions (JSONB — parse, never cast). */
export const servedQuestionsSchema = z.array(
  z.object({
    questionId: z.string().uuid(),
    version: z.number().int(),
    /** Option ids in the exact order served to this session. */
    optionIds: z.array(z.string().uuid()).min(2),
  }),
);
export type ServedQuestions = z.infer<typeof servedQuestionsSchema>;

export const startAssessmentSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
});

export const saveAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  optionId: z.string().uuid(),
  timeSpentMs: z.number().int().nonnegative().max(3_600_000).optional(),
});

export const submitAssessmentSchema = z.object({
  sessionId: z.string().uuid(),
});
