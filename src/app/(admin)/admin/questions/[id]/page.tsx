import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { QuestionForm } from "@/features/questions/components/question-form";
import * as db from "@/features/questions/server/db";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.admin.questions.editTitle };

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const [question, competencies] = await Promise.all([
    db.getFullQuestion(id),
    db.listCompetencyRefs(),
  ]);
  if (!question) notFound();

  const responseCount = await db.countResponsesForQuestion(id);
  const slugById = new Map(competencies.map((c) => [c.id, c.slug]));

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">
        {strings.admin.questions.editTitle}{" "}
        <span className="text-muted-foreground text-base">
          ({question.status}, {strings.admin.questions.version}
          {question.version})
        </span>
      </h1>
      <QuestionForm
        competencies={competencies}
        draft={{
          id: question.id,
          title: question.title,
          scenario: question.scenario,
          difficulty: question.difficulty,
          industryTags: question.industry_tags,
          status: question.status,
          locked: responseCount > 0,
          options: question.answer_options
            .sort((a, b) => a.author_position - b.author_position)
            .map((option) => ({
              id: option.id,
              content: option.content,
              signals: option.option_signals.map((signal) => ({
                competencySlug: slugById.get(signal.competency_id) ?? "",
                weight: Number(signal.weight),
              })),
            })),
        }}
      />
    </section>
  );
}
