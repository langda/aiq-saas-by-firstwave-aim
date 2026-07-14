/**
 * Typed return value for every server action (PROJECT_STRUCTURE §8).
 * Raw errors are logged server-side and never serialized to the client;
 * the UI switches on `error.code`.
 */
export type ActionError = {
  code:
    | "unauthenticated"
    | "forbidden"
    | "not_found"
    | "invalid_input"
    | "conflict"
    | "internal";
  message: string;
};

export type Result<T> =
  { ok: true; data: T } | { ok: false; error: ActionError };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err<T>(code: ActionError["code"], message: string): Result<T> {
  return { ok: false, error: { code, message } };
}
