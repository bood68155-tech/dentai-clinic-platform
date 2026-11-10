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

      <main id="main" className="flex-1 font-sans">
        <div className="mx-auto grid w-full max-w-[82rem] gap-12 px-6 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-10 lg:py-24">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted transition-colors hover:text-forest"
            >
              <ChevronLeft className="size-3.5" />
              Back to the clinic
            </Link>

            <p className="eyebrow mt-8">Account</p>
            <h1 className="mt-5 max-w-[11ch] font-display text-[clamp(2.8rem,5vw,4.6rem)] font-extrabold leading-[0.9] tracking-[-0.065em] text-forest">
              Your visits, in one place.
            </h1>
            <p className="font-editorial mt-5 max-w-md text-[1.08rem] leading-[1.55] text-muted sm:text-[1.16rem]">
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

          <div className="surface p-7 lg:p-9">
            <h2 className="font-display text-[1.7rem] font-extrabold tracking-[-0.05em] text-forest">
              Create an account
            </h2>
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
