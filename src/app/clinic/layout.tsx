import type { Metadata } from "next";

import { MobileNav, Sidebar } from "@/components/clinic/sidebar";
import { requireStaffUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Clinic platform",
  description: "Patients, appointments and dental charts for the NUV practice.",
};

/**
 * Every screen in the clinic reads live practice data, and the navigation shell
 * highlights the current section, so navigations into this segment legitimately
 * wait on the request. Data-heavy sections still stream inside their own
 * <Suspense> boundaries.
 *
 * This layout is the auth boundary for the workspace: only staff roles may
 * reach anything under `/clinic`. Guests are sent to `/login`, patients to
 * their own dashboard.
 */
export const instant = false;

export default async function ClinicLayout({ children }: LayoutProps<"/clinic">) {
  const user = await requireStaffUser();

  return (
    <div className="flex min-h-screen flex-1 bg-cream font-sans">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
