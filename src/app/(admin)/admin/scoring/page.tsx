import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfigEditor } from "@/features/scoring/components/config-editor";
import { activateScoringConfig } from "@/features/scoring/server/actions";
import * as service from "@/features/scoring/server/service";
import { getAuthContext } from "@/lib/auth/context";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.admin.scoring.title };

export default async function ScoringPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const ctx = await getAuthContext();
  if (!ctx) notFound();
  const [{ error }, configs] = await Promise.all([
    searchParams,
    service.listConfigs(ctx),
  ]);
  const s = strings.admin.scoring;
  const active = configs.find((c) => c.status === "active");

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{s.title}</h1>
        <p className="text-muted-foreground text-sm">{s.subtitle}</p>
      </div>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{s.versions}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{s.version}</TableHead>
                <TableHead>{strings.admin.common.status}</TableHead>
                <TableHead>{s.created}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="tabular-nums">
                    v{config.version}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        config.status === "active" ? "default" : "outline"
                      }
                    >
                      {config.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(config.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {config.status !== "active" && (
                      <form action={activateScoringConfig} className="inline">
                        <input type="hidden" name="id" value={config.id} />
                        <Button variant="ghost" size="sm" type="submit">
                          {s.activate}
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{s.newVersion}</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigEditor
            initialJson={JSON.stringify(active?.config ?? {}, null, 2)}
          />
        </CardContent>
      </Card>
    </section>
  );
}
