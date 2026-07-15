import Link from "next/link";
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
import { retireQuestion } from "@/features/questions/server/actions";
import * as db from "@/features/questions/server/db";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.admin.questions.title };

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, questions] = await Promise.all([
    searchParams,
    db.listQuestions(),
  ]);
  const s = strings.admin;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{s.questions.title}</h1>
        <Button
          nativeButton={false}
          render={<Link href="/admin/questions/new" />}
        >
          {s.common.newItem}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      {questions.length === 0 ? (
        <p className="text-muted-foreground">{s.common.empty}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{s.questions.questionTitle}</TableHead>
              <TableHead>{s.common.status}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>
                  <Link
                    href={`/admin/questions/${question.id}`}
                    className="hover:underline"
                  >
                    {question.title}
                  </Link>{" "}
                  <span className="text-muted-foreground text-xs">
                    {s.questions.version}
                    {question.version}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      question.status === "published" ? "default" : "outline"
                    }
                  >
                    {question.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {question.status === "published" && (
                    <form action={retireQuestion} className="inline">
                      <input type="hidden" name="id" value={question.id} />
                      <input type="hidden" name="target" value="draft" />
                      <Button variant="ghost" size="sm" type="submit">
                        {s.common.unpublish}
                      </Button>
                    </form>
                  )}
                  {question.status !== "archived" && (
                    <form action={retireQuestion} className="inline">
                      <input type="hidden" name="id" value={question.id} />
                      <input type="hidden" name="target" value="archived" />
                      <Button variant="ghost" size="sm" type="submit">
                        {s.common.archive}
                      </Button>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
