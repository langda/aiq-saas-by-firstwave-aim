import { z } from "zod";

/** One behavioral signal as authored (competency-level in M2; traits later). */
export const signalInputSchema = z.object({
  competencySlug: z.string().min(1),
  weight: z.coerce.number().min(0.25).max(5),
});

export const optionInputSchema = z.object({
  id: z.string().uuid().optional(),
  content: z.string().min(1).max(500),
  signals: z.array(signalInputSchema).max(4),
});

export const questionUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  scenario: z.string().min(1).max(2000),
  difficulty: z.coerce.number().int().min(1).max(5).default(1),
  industryTags: z.array(z.string().min(1).max(40)).max(10).default([]),
  options: z.array(optionInputSchema).min(2).max(4),
});

export type QuestionUpsertInput = z.infer<typeof questionUpsertSchema>;

export const questionIdSchema = z.object({ id: z.string().uuid() });
