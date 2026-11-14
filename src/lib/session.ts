import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { and, eq, isNull, sql } from "drizzle-orm";
import { cookies, headers } from "next/headers";

import { getDb, isDatabaseConfigured } from "@/db";
import { sessions, users, type User } from "@/db/schema";

/**
 * Session tokens are opaque 32-byte random values. Only their SHA-256 hash is
 * stored, so a database leak cannot be replayed. Cookies are httpOnly,
 * SameSite=Lax, and Secure in production, and live for 30 days with sliding
 * renewal (the expiry moves forward when the session is used after a day).
 */
export const SESSION_COOKIE_NAME = "nuv.session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const RENEW_AFTER_MS = 24 * 60 * 60 * 1000;

export type SessionUser = Pick<
  User,
  "id" | "clinicId" | "fullName" | "email" | "role" | "patientId"
>;

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Developer-only sign-in used while no database is configured (see
 * `isDevAdminFallbackEnabled`). The credentials are intentionally public and
 * the resulting session is a sentinel that only `readCurrentUser` understands.
 */
export const DEV_ADMIN_EMAIL = "admin@nuv.com";
export const DEV_ADMIN_PASSWORD = "admin123";
const DEV_ADMIN_TOKEN = "dev-admin-fallback";
const DEV_ADMIN_USER_ID = "00000000-0000-4000-8000-000000000000";
const DEV_ADMIN_CLINIC_ID = "00000000-0000-4000-8000-000000000001";

export function isDevAdminFallbackEnabled(): boolean {
  // Never in a production build, and never once a real database exists: the
  // fallback exists purely to browse the UI before `DATABASE_URL` is set.
  return process.env.NODE_ENV !== "production" && !isDatabaseConfigured();
}

function devAdminUser(): SessionUser {
  return {
    id: DEV_ADMIN_USER_ID,
    clinicId: DEV_ADMIN_CLINIC_ID,
    fullName: "Dev Admin",
    email: DEV_ADMIN_EMAIL,
    role: "owner",
    patientId: null,
  };
}

/** Open the database-less developer session. Call from a server action only. */
export async function createDevAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(
    SESSION_COOKIE_NAME,
    DEV_ADMIN_TOKEN,
    cookieOptions(SESSION_TTL_MS / 1000),
  );
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function requestMeta(): Promise<{ ip: string | null; ua: string | null }> {
  try {
    const headersStore = await headers();
    const forwarded = headersStore.get("x-forwarded-for");
    return {
      ip: forwarded?.split(",")[0]?.trim() ?? null,
      ua: headersStore.get("user-agent")?.slice(0, 300) ?? null,
    };
  } catch {
    return { ip: null, ua: null };
  }
}

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Create a session row and set the cookie. Call from a server action only. */
export async function createSession(userId: string): Promise<void> {
  const db = getDb();
  const token = generateSessionToken();
  const now = new Date();
  const { ip, ua } = await requestMeta();

  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    ipAddress: ip,
    userAgent: ua,
    createdAt: now,
    lastSeenAt: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
  });

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, cookieOptions(SESSION_TTL_MS / 1000));
}

/** Revoke the current session (if any) and clear the cookie. */
export async function destroyCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;

  if (token && isDatabaseConfigured()) {
    try {
      const db = getDb();
      await db
        .update(sessions)
        .set({ revokedAt: new Date() })
        .where(eq(sessions.tokenHash, hashToken(token)));
    } catch (error) {
      // Signing out must still clear the cookie when the database is down or
      // misconfigured; the server-side row expires on its own.
      console.error("destroyCurrentSession failed", error);
    }
  }

  store.delete(SESSION_COOKIE_NAME);
}

/** Revoke every session for a user (password change, admin action). */
export async function revokeAllSessions(userId: string): Promise<void> {
  const db = getDb();
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}

/**
 * Read the current session from the cookie and return the signed-in user.
 * Returns null for missing, revoked, or expired sessions. Slides the expiry
 * forward once a day, and opportunistically sweeps long-dead rows.
 */
export async function readCurrentUser(): Promise<SessionUser | null> {
  // Read the cookie first: it makes the render request-scoped before any
  // database work happens, so a production build never opens a connection to
  // prerender a per-user page. No cookie also means no session to look up.
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  if (token === DEV_ADMIN_TOKEN && isDevAdminFallbackEnabled()) {
    return devAdminUser();
  }

  // No database, no provable session: treat as signed out instead of throwing.
  if (!isDatabaseConfigured()) return null;

  const db = getDb();

  const tokenHash = hashToken(token);
  const now = new Date();

  try {
    const [row] = await db
      .select({ session: sessions, user: users })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.tokenHash, tokenHash))
      .limit(1);

    if (!row || row.session.revokedAt || row.session.expiresAt <= now || !row.user.isActive) {
      return null;
    }

    const session = row.session;

    // Sliding renewal: first use of the day pushes expiry out by a full TTL.
    if (now.getTime() - session.lastSeenAt.getTime() > RENEW_AFTER_MS) {
      await db
        .update(sessions)
        .set({
          lastSeenAt: now,
          expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
        })
        .where(eq(sessions.id, session.id));

      store.set(
        SESSION_COOKIE_NAME,
        token,
        cookieOptions(SESSION_TTL_MS / 1000),
      );

      // Best-effort cleanup of rows that died long ago. Fire-and-forget is
      // wrong in server actions, so just await it — it is one indexed delete.
      await db
        .delete(sessions)
        .where(
          sql`(${sessions.expiresAt} < ${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)} or ${sessions.revokedAt} is not null and ${sessions.revokedAt} < ${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)})`,
        )
        .catch(() => undefined);
    }

    const { id, clinicId, fullName, email, role, patientId } = row.user;
    return { id, clinicId, fullName, email, role, patientId };
  } catch (error) {
    // A transient database outage must not turn every page into a 500. Treat
    // the session as unreadable; the next request can recover.
    console.error("readCurrentUser failed", error);
    return null;
  }
}
