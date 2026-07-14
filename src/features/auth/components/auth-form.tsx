"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Result } from "@/lib/result";

type Field = {
  name: string;
  label: string;
  type: "text" | "email" | "password";
  autoComplete?: string;
};

type AuthFormProps = {
  action: (
    prev: Result<null> | null,
    formData: FormData,
  ) => Promise<Result<null>>;
  fields: Field[];
  submitLabel: string;
  successMessage?: string;
};

export function AuthForm({
  action,
  fields,
  submitLabel,
  successMessage,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col gap-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            id={field.name}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            required
          />
        </div>
      ))}
      {state && !state.ok && (
        <p role="alert" className="text-destructive text-sm">
          {state.error.message}
        </p>
      )}
      {state?.ok && successMessage && (
        <p
          role="status"
          className="text-sm text-emerald-600 dark:text-emerald-400"
        >
          {successMessage}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "…" : submitLabel}
      </Button>
    </form>
  );
}
