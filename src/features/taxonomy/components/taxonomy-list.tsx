import Link from "next/link";

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
import { strings } from "@/lib/strings";

import type { TaxonomyKind } from "../schemas";
import { setTaxonomyStatus } from "../server/actions";
import * as db from "../server/db";

/** Server component: list + status actions for competencies or personas. */
export async function TaxonomyList({
  kind,
  title,
  basePath,
  error,
}: {
  kind: TaxonomyKind;
  title: string;
  basePath: string;
  error?: string;
}) {
  const items = await db.listItems(kind);
  const s = strings.admin.common;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Button nativeButton={false} render={<Link href={`${basePath}/new`} />}>
          {s.newItem}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{s.name}</TableHead>
            <TableHead>{s.slug}</TableHead>
            <TableHead>{s.status}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Link
                  href={`${basePath}/${item.id}`}
                  className="hover:underline"
                >
                  {item.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs">
                {item.slug}
              </TableCell>
              <TableCell>
                <Badge
                  variant={item.status === "published" ? "default" : "outline"}
                >
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <form action={setTaxonomyStatus} className="inline">
                  <input type="hidden" name="kind" value={kind} />
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={
                      item.status === "published" ? "archived" : "published"
                    }
                  />
                  <Button variant="ghost" size="sm" type="submit">
                    {item.status === "published" ? s.archive : s.restore}
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
