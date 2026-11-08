import "server-only";

import { connection } from "next/server";

export type Loaded<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Runs a read and turns failures into a value the UI can render.
 *
 * A freshly deployed preview has no `DATABASE_URL` yet; the dashboard should
 * explain that instead of showing a stack trace.
 */
export async function load<T>(read: () => Promise<T>): Promise<Loaded<T>> {
  // Practice data is per-request: opt the caller into dynamic rendering so a
  // build never bakes an empty or error state into the static shell.
  await connection();

  try {
    return { ok: true, data: await read() };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.error("[db]", message);
    return {
      ok: false,
      error: message.includes("DATABASE_URL")
        ? "DATABASE_URL is not configured for this deployment."
        : "The database request failed.",
    };
  }
}
