import "server-only";

import { connection } from "next/server";

import { getDatabaseProblem, getDatabaseStatus } from "@/db";

export type Loaded<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Runs a read and turns failures into a value the UI can render.
 *
 * A freshly deployed preview has no `DATABASE_URL` yet, or a pasted value may
 * be malformed; the dashboard should explain that instead of showing a stack
 * trace or crashing the request.
 */
export async function load<T>(read: () => Promise<T>): Promise<Loaded<T>> {
  // Practice data is per-request: opt the caller into dynamic rendering so a
  // build never bakes an empty or error state into the static shell.
  await connection();

  // Resolve configuration before touching the client. When DATABASE_URL is
  // absent or malformed this is a normal, renderable state — not an exception.
  const status = getDatabaseStatus();
  if (status !== "configured") {
    const problem = getDatabaseProblem();
    console.error("[db]", problem);
    return {
      ok: false,
      error:
        status === "missing"
          ? "DATABASE_URL is not configured for this deployment. Add it in the hosting environment variables and redeploy."
          : "DATABASE_URL is invalid. Use a full postgresql:// connection string, and URL-encode special characters in the password.",
    };
  }

  try {
    return { ok: true, data: await read() };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.error("[db]", message);
    return {
      ok: false,
      error:
        message.includes("DATABASE_URL") || message.includes("could not be initialised")
          ? "The database is not available. Check DATABASE_URL in the deployment environment."
          : "The database request failed. Please try again in a moment.",
    };
  }
}
