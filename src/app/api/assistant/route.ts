import { CLINIC_PROFILE } from "@/lib/clinic-profile";
import { AssistantError, isAssistantConfigured, readConversation, runAssistant } from "@/lib/assistant";

/**
 * POST /api/assistant
 *
 * Stateless turn endpoint for the website's booking assistant. The browser
 * sends the conversation so far; the server adds the clinic context, runs the
 * tool-calling loop, and — when the visitor has agreed to a slot — writes the
 * appointment through `requestAppointment`, the same mutation the public
 * booking form uses.
 *
 * No API key ever reaches the client: the provider call happens here.
 */

// `cacheComponents` is enabled in next.config.ts, which rejects `runtime` and
// `dynamic` segment config here. Reading the request body already makes this
// handler dynamic.

// A reasoning model can take 30s per round before a tool call, and the default
// serverless budget is shorter than that.
export const maxDuration = 60;

const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

/**
 * Best-effort throttle. Serverless instances each keep their own window, so
 * this blunts casual abuse of a paid endpoint rather than guaranteeing a cap.
 */
const recentRequests = new Map<string, number[]>();

function isRateLimited(key: string, now: number): boolean {
  const hits = (recentRequests.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  if (hits.length >= MAX_REQUESTS_PER_WINDOW) {
    recentRequests.set(key, hits);
    return true;
  }
  hits.push(now);
  recentRequests.set(key, hits);

  if (recentRequests.size > 500) {
    for (const [entry, times] of recentRequests) {
      if (times.every((at) => now - at >= WINDOW_MS)) recentRequests.delete(entry);
    }
  }
  return false;
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  if (!isAssistantConfigured()) {
    return Response.json(
      {
        error: "unconfigured",
        message: `The live assistant is not connected yet. Call us on ${CLINIC_PROFILE.phone} or use Book Online.`,
      },
      { status: 503 },
    );
  }

  if (isRateLimited(clientKey(request), Date.now())) {
    return Response.json(
      {
        error: "rate_limited",
        message: "That is a lot of questions at once! Give it a minute, or call the clinic.",
      },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as { messages?: unknown } | null;
  const messages = readConversation(body?.messages);

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return Response.json(
      { error: "bad_request", message: "Send at least one message from the visitor." },
      { status: 400 },
    );
  }

  try {
    const result = await runAssistant(messages);
    return Response.json(result);
  } catch (error) {
    if (error instanceof AssistantError) {
      console.error("[assistant]", error.message);
      return Response.json(
        {
          error: "provider_error",
          message: `I could not reach the front desk just now. Call ${CLINIC_PROFILE.phone} and we will help straight away.`,
        },
        { status: 502 },
      );
    }

    console.error("[assistant] unexpected failure", error);
    return Response.json(
      {
        error: "server_error",
        message: `Something went wrong on our side. Call ${CLINIC_PROFILE.phone} and we will book you in.`,
      },
      { status: 500 },
    );
  }
}
