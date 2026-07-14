import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";

/** Routes that require a signed-in, PERMANENT account (the (app) group). */
const PERMANENT_ONLY_PREFIXES = ["/dashboard", "/results"];
/** Coarse gate only — the (admin) layout does the real role check. */
const ADMIN_PREFIX = "/admin";

/**
 * Next 16 proxy (formerly "middleware"): refreshes the Supabase session on
 * every matched request and applies coarse auth gating (ARCHITECTURE §5.2).
 * Role checks live in layouts and services — never here.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() also refreshes an expiring token. Do not remove.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase unreachable (e.g. local stack down) — treat as signed out
    // rather than failing every request.
  }

  const { pathname } = request.nextUrl;

  const needsPermanentAccount =
    PERMANENT_ONLY_PREFIXES.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith(ADMIN_PREFIX);

  if (needsPermanentAccount && (!user || user.is_anonymous)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Skip static assets and images; run everywhere else.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
