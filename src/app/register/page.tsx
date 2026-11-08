import Link from "next/link";
import { Suspense } from "react";

import { RegisterForm } from "@/components/auth/register-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CheckIcon, ChevronLeft } from "@/components/icons";
import { getCurrentUser, roleHome } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Create an account",
  description:
    "Create a Dentai patient account to see your visits and treatment plan.",
};

/** Reads the session cookie to redirect signed-in users, so it is a blocking
 * route rather than a prerendered static shell. */
export const instant = false;

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(roleHome(user.role));

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-20">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted transition-colors hover:text-forest"
            >
              <ChevronLeft className="size-3.5" />
              Back to the clinic
            </Link>

            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.26em] text-clay">
              Account
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.4rem,4.6vw,3.6rem)] leading-[0.96] text-forest">
              Your visits, in one place.
            </h1>
            <p className="mt-5 max-w-sm text-[13.5px] leading-[1.75] text-muted">
              A patient account lets you see your upcoming appointments and agreed
              treatment plan without calling the front desk.
            </p>

            <ul className="mt-8 space-y-3 text-[12.5px] text-forest/80">
              {[
                "See upcoming and past visits",
                "Review your agreed treatment plan",
                "Link automatically to your existing record by email",
                "No marketing — account stays quiet unless you book",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-forest-500" />
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-6 max-w-sm text-[12px] leading-relaxed text-muted">
              On the practice team? Staff accounts are provisioned by the clinic —
              ask the front desk to set one up for you.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-line bg-cream-50 p-7 lg:p-9">
            <h2 className="font-display text-2xl text-forest">Create an account</h2>
            <p className="mt-2 text-[12.5px] text-muted">
              Patient accounts only. Takes under a minute.
            </p>
            <div className="mt-6">
              <Suspense fallback={null}>
                <RegisterForm />
              </Suspense>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
