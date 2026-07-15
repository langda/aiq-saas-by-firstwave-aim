import type { Metadata } from "next";

import { QuestionForm } from "@/features/questions/components/question-form";
import * as db from "@/features/questions/server/db";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.admin.questions.newTitle };

export default async function NewQuestionPage() {
  const competencies = await db.listCompetencyRefs();
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">
        {strings.admin.questions.newTitle}
      </h1>
      <QuestionForm
        competencies={competencies}
        draft={{
          title: "",
          scenario: "",
          difficulty: 1,
          industryTags: [],
          options: [
            { content: "", signals: [] },
            { content: "", signals: [] },
            { content: "", signals: [] },
            { content: "", signals: [] },
          ],
        }}
      />
    </section>
  );
}
