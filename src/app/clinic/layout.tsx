import type { Metadata } from "next";

import { MobileNav, Sidebar } from "@/components/clinic/sidebar";

export const metadata: Metadata = {
  title: "Clinic platform",
  description: "Patients, appointments and dental charts for the Dentai practice.",
};

/**
 * Every screen in the clinic reads live practice data, and the navigation shell
 * highlights the current section, so navigations into this segment legitimately
 * wait on the request. Data-heavy sections still stream inside their own
 * <Suspense> boundaries.
 */
export const instant = false;

export default function ClinicLayout({ children }: LayoutProps<"/clinic">) {
  return (
    <div className="flex min-h-screen flex-1 bg-cream">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
