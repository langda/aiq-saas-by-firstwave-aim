import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toggleAssessmentPublished } from "@/features/questions/server/actions";
import * as db from "@/features/questions/server/db";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.admin.assessments.title };

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, assessments] = await Promise.all([
    searchParams,
    db.listAssessments(),
  ]);
  const ready = await Promise.all(
    assessments.map((a) => db.countPublishedQuestionsInAssessment(a.id)),
  );
  const s = strings.admin;

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{s.assessments.title}</h1>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{s.common.name}</TableHead>
            <TableHead>{s.common.status}</TableHead>
            <TableHead>{s.assessments.questionsReady}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((assessment, index) => (
            <TableRow key={assessment.id}>
              <TableCell>{assessment.title}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    assessment.status === "published" ? "default" : "outline"
                  }
                >
                  {assessment.status}
                </Badge>
              </TableCell>
              <TableCell className="tabular-nums">
                {ready[index]} / {assessment.question_count}
              </TableCell>
              <TableCell className="text-right">
                <form action={toggleAssessmentPublished} className="inline">
                  <input type="hidden" name="id" value={assessment.id} />
                  <input
                    type="hidden"
                    name="publish"
                    value={assessment.status === "published" ? "false" : "true"}
                  />
                  <Button variant="ghost" size="sm" type="submit">
                    {assessment.status === "published"
                      ? s.common.unpublish
                      : s.common.publish}
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
