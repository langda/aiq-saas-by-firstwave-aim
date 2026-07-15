import { z } from "zod";

/** Shared shape for competencies and personas (identity fields only —
 *  persona signatures live in scoring config, never here). */
export const taxonomyItemSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase-kebab-case"),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).default(""),
  displayOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export type TaxonomyItemInput = z.infer<typeof taxonomyItemSchema>;

export const taxonomyKindSchema = z.enum(["competency", "persona"]);
export type TaxonomyKind = z.infer<typeof taxonomyKindSchema>;
