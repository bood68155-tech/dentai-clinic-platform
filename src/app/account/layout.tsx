import Link from "next/link";
import { connection } from "next/server";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { ToothMark } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { requirePatientUser } from "@/lib/auth";

export const metadata = {
  title: "Your account",
  description: "Your visits and treatment plan at Dentai.",
};

/**
 * Patients only. Staff are redirected to the clinic workspace by the guard,
 * so nobody ever lands on a dashboard that is not theirs.
 *
 * `instant = false`: the content depends on the signed-in user's cookies, so
 * it must never be prerendered as a static shell.
 */
export const instant = false;

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The dashboard is per-user: render at request time, never at build time.
  await connection();

  const user = await requirePatientUser();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line bg-cream-50/80">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 text-forest">
            <ToothMark className="size-5" />
            <span className="font-display text-xl tracking-[-0.03em]">Dentai</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-5 text-[12px] font-medium text-muted sm:flex" aria-label="Account">
            <Link href="/account" className="text-forest">My visits</Link>
            <Link href="/book" className="transition-colors hover:text-forest">Book a visit</Link>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[12px] font-medium leading-tight text-forest">{user.fullName}</p>
              <p className="text-[10px] text-muted">{user.email}</p>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-forest text-[12px] font-semibold text-cream" aria-hidden="true">
              {user.fullName
                .split(" ")
                .map((part) => part.charAt(0))
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:py-14">{children}</div>
      </main>

      <SiteFooter />
    </div>
  );
}
