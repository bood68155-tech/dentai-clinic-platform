import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ChevronLeft } from "@/components/icons";
import { getCurrentUser, roleHome } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your NUV account.",
};

/** The page reads the session cookie to skip sign-in for signed-in users, so
 * it waits on the request instead of prerendering a static shell. */
export const instant = false;

const ROLE_BLURB: Record<string, string> = {
  owner: "Practice owner",
  dentist: "Doctor",
  hygienist: "Hygienist",
  assistant: "Assistant",
  receptionist: "Front desk",
  patient: "Patient",
};

export default async function LoginPage() {
  // Already signed in? Send them to where their role belongs.
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
            <h1 className="mt-5 max-w-[10ch] font-display text-[clamp(2.8rem,5vw,4.6rem)] font-extrabold leading-[0.9] tracking-[-0.065em] text-forest">
              Welcome back.
            </h1>
            <p className="font-editorial mt-5 max-w-md text-[1.08rem] leading-[1.55] text-muted sm:text-[1.16rem]">
              Sign in to see your upcoming visits and treatment plan, or to open the
              clinic workspace if you are on the practice team.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {Object.entries(ROLE_BLURB).map(([role, label]) => (
                <span
                  key={role}
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    role === "patient"
                      ? "border-clay/30 bg-clay/10 text-clay"
                      : "border-forest/20 bg-forest/5 text-forest/70"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>

            <p className="mt-6 max-w-sm text-[12px] leading-relaxed text-muted">
              Staff accounts are created by the clinic. First time here?{" "}
              <Link href="/register" className="font-medium text-forest underline underline-offset-4 hover:text-clay">
                Create a patient account
              </Link>{" "}
              — if you have booked with us before, your record will be linked
              automatically.
            </p>
          </div>

          <div className="surface p-7 lg:p-9">
            <h2 className="font-display text-[1.7rem] font-extrabold tracking-[-0.05em] text-forest">
              Sign in
            </h2>
            <p className="mt-2 text-[12.5px] text-muted">
              Your session stays on this device for 30 days.
            </p>
            <div className="mt-6">
              <Suspense fallback={null}>
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
