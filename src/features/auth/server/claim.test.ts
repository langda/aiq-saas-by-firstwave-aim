import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthContext } from "@/core/types";

import { parseClaimCookie } from "../claim-cookie";

vi.mock("server-only", () => ({}));
vi.mock("./claim-db", () => ({ claimSession: vi.fn() }));

import * as db from "./claim-db";
import { claimFromCookie } from "./claim";

const claimSessionMock = vi.mocked(db.claimSession);

function ctx(overrides?: Partial<AuthContext>): AuthContext {
  return {
    userId: "permanent-user",
    role: "user",
    orgId: null,
    isAnonymous: false,
    ...overrides,
  };
}

const COOKIE =
  "11111111-1111-4111-8111-111111111111:22222222-2222-4222-8222-222222222222";

describe("parseClaimCookie", () => {
  it("parses sessionId:token and rejects malformed values", () => {
    expect(parseClaimCookie("abc:def")).toEqual({
      sessionId: "abc",
      claimToken: "def",
    });
    expect(parseClaimCookie("no-separator")).toBeNull();
    expect(parseClaimCookie(":missing")).toBeNull();
    expect(parseClaimCookie(undefined)).toBeNull();
  });
});

describe("claimFromCookie", () => {
  beforeEach(() => claimSessionMock.mockReset());

  it("re-parents when a permanent user presents a valid token", async () => {
    claimSessionMock.mockResolvedValue(true);
    const outcome = await claimFromCookie(ctx(), COOKIE);
    expect(outcome).toEqual({
      claimed: true,
      sessionId: "11111111-1111-4111-8111-111111111111",
    });
    expect(claimSessionMock).toHaveBeenCalledWith({
      sessionId: "11111111-1111-4111-8111-111111111111",
      claimToken: "22222222-2222-4222-8222-222222222222",
      newUserId: "permanent-user",
    });
  });

  it("HOSTILE: an anonymous caller can never claim, even with a valid token", async () => {
    const outcome = await claimFromCookie(ctx({ isAnonymous: true }), COOKIE);
    expect(outcome.claimed).toBe(false);
    expect(claimSessionMock).not.toHaveBeenCalled();
  });

  it("HOSTILE: a wrong/expired token claims nothing (DB says no)", async () => {
    claimSessionMock.mockResolvedValue(false);
    const outcome = await claimFromCookie(ctx(), COOKIE);
    expect(outcome).toEqual({ claimed: false, sessionId: null });
  });

  it("does nothing without a cookie — no DB call at all", async () => {
    const outcome = await claimFromCookie(ctx(), undefined);
    expect(outcome.claimed).toBe(false);
    expect(claimSessionMock).not.toHaveBeenCalled();
  });
});
