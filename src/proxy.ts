import { NextResponse, type NextRequest } from "next/server";

/**
 * Coarse authentication gate, in front of any rendering.
 *
 * Server components render layouts and pages in parallel, so a redirect thrown
 * in a layout can arrive after sibling content has already been streamed. This
 * proxy answers first: without a session cookie there is nothing to render for
 * a private route, and the browser gets a plain 307 before any HTML exists.
 *
 * It only checks that a cookie is present — it is deliberately not the
 * authorisation boundary. Roles are verified in the server layouts, pages and
 * actions against the database (`src/lib/auth.ts`).
 */
const SESSION_COOKIE = "dentai.session";

const PRIVATE_PREFIXES = ["/clinic", "/account"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isPrivate = PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!isPrivate) return NextResponse.next();

  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/login") {
    loginUrl.searchParams.set("next", `${pathname}${search}`);
  }
  return NextResponse.redirect(loginUrl, 307);
}

export const config = {
  matcher: ["/clinic/:path*", "/account/:path*"],
};
