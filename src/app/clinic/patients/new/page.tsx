import Link from "next/link";

import { PatientForm } from "@/components/clinic/patient-form";
import { PageHeader } from "@/components/clinic/ui";
import { ChevronLeft } from "@/components/icons";
import { requireStaffUser } from "@/lib/auth";

export const metadata = { title: "New patient" };

export default async function NewPatientPage() {
  await requireStaffUser();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-7">
      <Link
        href="/clinic/patients"
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted transition-colors hover:text-forest"
      >
        <ChevronLeft className="size-3.5" />
        All patients
      </Link>

      <PageHeader
        eyebrow="New record"
        title="Add a patient"
        description="Only a first and last name are required. Clinical detail can be completed at the first visit."
      />

      <PatientForm />
    </div>
  );
}
