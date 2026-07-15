"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Result } from "@/lib/result";
import { strings } from "@/lib/strings";

import { saveTaxonomyItem } from "../server/actions";
import type { TaxonomyKind } from "../schemas";

type Item = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  display_order: number;
};

/** One form for competencies AND personas — identity fields are identical. */
export function TaxonomyForm({
  kind,
  item,
}: {
  kind: TaxonomyKind;
  item?: Item;
}) {
  const [state, formAction, pending] = useActionState<
    Result<null> | null,
    FormData
  >(saveTaxonomyItem, null);
  const s = strings.admin.common;

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <input type="hidden" name="kind" value={kind} />
      {item?.id && <input type="hidden" name="id" value={item.id} />}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{s.name}</Label>
        <Input id="name" name="name" defaultValue={item?.name} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">{s.slug}</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={item?.slug}
          required
          readOnly={!!item?.id}
          aria-describedby="slug-hint"
        />
        <p id="slug-hint" className="text-muted-foreground text-xs">
          {s.slugHint}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">{s.description}</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={item?.description}
          rows={3}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="displayOrder">{s.displayOrder}</Label>
        <Input
          id="displayOrder"
          name="displayOrder"
          type="number"
          min={0}
          defaultValue={item?.display_order ?? 0}
          className="w-28"
        />
      </div>

      {state && !state.ok && (
        <p role="alert" className="text-destructive text-sm">
          {state.error.message}
        </p>
      )}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? s.saving : s.save}
        </Button>
      </div>
    </form>
  );
}
