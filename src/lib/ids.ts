import { randomBytes } from "node:crypto";

/** Base58 — no 0/O/I/l ambiguity; safe in URLs and read-aloud contexts. */
const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Unguessable public identifier (certificate codes — ARCHITECTURE §13).
 * 21 chars of base58 ≈ 123 bits of entropy: enumeration is not a risk.
 */
export function generatePublicCode(length = 21): string {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}
