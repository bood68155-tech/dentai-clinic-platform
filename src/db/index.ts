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

const globalForDb = globalThis as unknown as {
  dentaiDb?: Db;
  dentaiClient?: ReturnType<typeof postgres>;
};

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): Db {
  if (globalForDb.dentaiDb) return globalForDb.dentaiDb;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and paste your Postgres connection string.",
    );
  }

  const client = postgres(url, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

  const db = drizzle(client, { schema, logger: false });

  // Reuse the connection across hot reloads in development.
  if (process.env.NODE_ENV !== "production") {
    globalForDb.dentaiClient = client;
    globalForDb.dentaiDb = db;
  }

  return db;
}

export { schema };
