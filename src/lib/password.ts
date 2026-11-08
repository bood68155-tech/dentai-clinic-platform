/**
 * Password hashing primitives.
 *
 * Uses Node's built-in scrypt (memory-hard, OWASP-recommended) so there is no
 * native dependency to install or audit, and hashing runs identically in the
 * Next.js server and in the `tsx` seed script. No `server-only` import here on
 * purpose: the seed script needs `hashPassword` too.
 */
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

/** 64-byte derived key, 16-byte random salt — well above current guidance. */
const KEY_LENGTH = 64;

function decode(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

/** Hash a password for storage as `salt.key` (both base64url). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt.toString("base64url")}.${key.toString("base64url")}`;
}

/**
 * Timing-safe check of a password against a stored hash. Returns false for
 * malformed input instead of throwing, so login can keep a single code path.
 */
export async function verifyPassword(
  password: string,
  stored: string | null | undefined,
): Promise<boolean> {
  if (!stored) return false;

  try {
    const [saltPart, keyPart] = stored.split(".");
    if (!saltPart || !keyPart) return false;

    const salt = decode(saltPart);
    const expected = decode(keyPart);
    const actual = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/**
 * Burns a full scrypt evaluation and returns false. Used when sign-in fails for
 * "no such user" or "no password set" so those cases take as long as a real
 * verification and don't leak account existence through timing.
 */
export async function dummyPasswordCheck(password: string): Promise<false> {
  const salt = randomBytes(16);
  const key = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  // Compare against itself to keep the operation shape identical.
  timingSafeEqual(key, key);
  return false;
}
