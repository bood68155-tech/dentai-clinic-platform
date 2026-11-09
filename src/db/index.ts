import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * Any Postgres works here — Neon, Vercel Postgres, Supabase, RDS or a local
 * instance — because this uses the standard wire protocol.
 *
 * `max: 1` and `prepare: false` keep it safe inside Vercel's serverless
 * functions and behind transaction-mode poolers such as PgBouncer, which Neon
 * and Supabase use for their pooled connection strings.
 */
type Db = PostgresJsDatabase<typeof schema>;
type Client = ReturnType<typeof postgres>;

export type DatabaseStatus = "configured" | "missing" | "invalid";

const globalForDb = globalThis as unknown as {
  dentaiDb?: Db;
  dentaiClient?: Client;
};

/**
 * Parameters used by other clients (Prisma, libpq wrappers) that postgres.js
 * would otherwise forward to the server as startup settings, where an
 * unknown name aborts the connection.
 */
const FOREIGN_URL_PARAMS = [
  "pgbouncer",
  "connection_limit",
  "pool_timeout",
  "statement_cache_size",
  "uselibpqcompat",
];

const CHANNEL_BINDINGS = new Set(["disable", "prefer", "require"]);
const TARGET_SESSION_ATTRS = new Set([
  "read-write",
  "read-only",
  "primary",
  "standby",
  "prefer-standby",
]);

/**
 * Vercel env values are pasted by hand: they regularly arrive with a trailing
 * newline or wrapped in quotes. Both make `new URL()` throw, even though the
 * underlying connection string is fine.
 */
function cleanRawUrl(raw: string): string {
  let value = raw.replace(/[\r\n]+/g, "").trim();

  const first = value[0];
  const last = value[value.length - 1];
  if (
    value.length > 1 &&
    ((first === '"' && last === '"') || (first === "'" && last === "'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  return value;
}

type ResolvedUrl =
  | { status: "configured"; url: string }
  | { status: "missing" | "invalid"; reason: string };

/**
 * Parse and normalise `DATABASE_URL` without connecting. This runs on demand,
 * never at module load, so a preview deployment with no environment variables
 * can still render its fallback UI.
 */
function resolveDatabaseUrl(): ResolvedUrl {
  const raw = process.env.DATABASE_URL;
  if (!raw || raw.trim().length === 0) {
    return { status: "missing", reason: "DATABASE_URL is not set." };
  }

  try {
    const parsed = new URL(cleanRawUrl(raw));

    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
      return {
        status: "invalid",
        reason: "DATABASE_URL must start with postgres:// or postgresql://.",
      };
    }

    if (!parsed.hostname) {
      return {
        status: "invalid",
        reason: "DATABASE_URL does not include a database host.",
      };
    }

    for (const key of FOREIGN_URL_PARAMS) {
      parsed.searchParams.delete(key);
    }

    // Remove empty values so they are not sent as startup parameters, and
    // drop option values postgres.js rejects outright.
    for (const [key, value] of [...parsed.searchParams]) {
      if (value.length === 0) {
        parsed.searchParams.delete(key);
        continue;
      }
      if (key === "channel_binding" && !CHANNEL_BINDINGS.has(value)) {
        parsed.searchParams.delete(key);
      }
      if (key === "target_session_attrs" && !TARGET_SESSION_ATTRS.has(value)) {
        parsed.searchParams.delete(key);
      }
    }

    return { status: "configured", url: parsed.toString() };
  } catch {
    return {
      status: "invalid",
      reason:
        "DATABASE_URL is not a valid URL. Encode special characters in the password and remove quotes or line breaks.",
    };
  }
}

/** Whether a usable-looking Postgres connection string is present. */
export function getDatabaseStatus(): DatabaseStatus {
  return resolveDatabaseUrl().status;
}

export function isDatabaseConfigured(): boolean {
  return getDatabaseStatus() === "configured";
}

/** A safe, non-secret explanation suitable for logs or the UI. */
export function getDatabaseProblem(): string | null {
  const resolved = resolveDatabaseUrl();
  return resolved.status === "configured" ? null : resolved.reason;
}

export class DatabaseUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

/**
 * Build (or return the cached) client. Returns null instead of throwing for
 * missing, malformed or unbuildable configuration, so callers can degrade.
 */
export function tryGetDb(): Db | null {
  if (globalForDb.dentaiDb) return globalForDb.dentaiDb;

  const resolved = resolveDatabaseUrl();
  if (resolved.status !== "configured") return null;

  try {
    const client = postgres(resolved.url, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 15,
      max_lifetime: 60 * 30,
      prepare: false,
    });

    const db = drizzle(client, { schema, logger: false });

    // Reuse one pool per server process. Creating a fresh client for every
    // query exhausts Neon's pooler on a busy page and surfaces as intermittent
    // CONNECT_TIMEOUT / "Connection closed" errors during requests such as
    // sign-in. The global also survives development hot reloads.
    globalForDb.dentaiClient = client;
    globalForDb.dentaiDb = db;

    return db;
  } catch (error) {
    // Do not log the error message: a malformed URL can echo the credentials.
    console.error(
      "[db] could not initialise the database client",
      error instanceof Error ? error.name : "unknown error",
    );
    return null;
  }
}

/**
 * Strict accessor for code that has already established it can handle a
 * missing database. Prefer `tryGetDb()` or `load()` in request paths.
 */
export function getDb(): Db {
  const db = tryGetDb();
  if (db) return db;

  const status = getDatabaseStatus();
  if (status === "missing") {
    throw new DatabaseUnavailableError(
      "DATABASE_URL is not configured for this deployment.",
    );
  }
  if (status === "invalid") {
    throw new DatabaseUnavailableError(
      "DATABASE_URL is not a valid Postgres connection string.",
    );
  }
  throw new DatabaseUnavailableError(
    "The database client could not be initialised.",
  );
}

export { schema };
