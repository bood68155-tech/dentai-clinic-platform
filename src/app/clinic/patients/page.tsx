import Link from "next/link";
import { Suspense } from "react";

import {
  DbNotice,
  EmptyState,
  ListSkeleton,
  PageHeader,
  Panel,
} from "@/components/clinic/ui";
import { PlusIcon } from "@/components/icons";
import { getClinic, listPatients, type PatientRow } from "@/db/queries";
import { load } from "@/db/safe";
import { ageFrom, formatDate, initials } from "@/lib/utils";

export default function PatientsPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-7">
      <PageHeader
        eyebrow="Records"
        title="Patients"
        description="Every active record, with medical alerts and outstanding treatment surfaced."
        actions={
          <Link
            href="/clinic/patients/new"
            className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-[12px] font-medium text-cream transition-colors hover:bg-forest-700"
          >
            <PlusIcon className="size-3.5" />
            New patient
          </Link>
        }
      />

      <Suspense fallback={<PatientsSkeleton />}>
        <PatientsContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function PatientsContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const result = await load(async () => {
    const clinic = await getClinic();
    if (!clinic) return { clinic: null, patients: [] as PatientRow[] };
    return {
      clinic,
      patients: await listPatients(clinic.id, q),
    };
  });

  if (!result.ok) return <DbNotice error={result.error} />;

  const { clinic, patients } = result.data;
  if (!clinic) {
    return (
      <EmptyState
        title="No clinic yet"
        body="Run the seed script to create the demo practice, practitioners and patients."
        action={{ label: "Add the first patient", href: "/clinic/patients/new" }}
      />
    );
  }

  const search = q?.trim() ?? "";

  return (
    <Panel
      title={`${patients.length} ${patients.length === 1 ? "record" : "records"}`}
      description={search ? `Filtered by “${search}”` : "Ordered by surname"}
      action={
        <form action="/clinic/patients" className="flex items-center gap-2">
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search name, phone, email"
            aria-label="Search patients"
            className="w-40 rounded-full border border-line bg-cream px-3.5 py-1.5 text-[11.5px] text-forest placeholder:text-muted/60 focus:border-forest/40 focus:outline-none sm:w-56"
          />
          <button
            type="submit"
            className="rounded-full border border-forest/15 px-3 py-1.5 text-[11px] font-medium text-forest transition-colors hover:border-forest/35"
          >
            Search
          </button>
        </form>
      }
      bodyClassName="p-0"
    >
      {patients.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title={search ? "No matches" : "No patients yet"}
            body={
              search
                ? "Try a different spelling, or search by phone number."
                : "Add the first patient record to start charting."
            }
            action={{ label: "Add a patient", href: "/clinic/patients/new" }}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-line/80 text-[9px] uppercase tracking-[0.16em] text-muted">
                <th className="px-5 py-2.5 font-semibold">Patient</th>
                <th className="px-4 py-2.5 font-semibold">Age / DOB</th>
                <th className="px-4 py-2.5 font-semibold">Contact</th>
                <th className="px-4 py-2.5 font-semibold">Last visit</th>
                <th className="px-4 py-2.5 font-semibold">Plan</th>
                <th className="px-5 py-2.5 font-semibold">Alerts</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => {
                const age = ageFrom(patient.dateOfBirth);
                return (
                  <tr
                    key={patient.id}
                    className="group border-b border-line/50 last:border-0 hover:bg-cream/60"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/clinic/patients/${patient.id}`}
                        className="flex items-center gap-3"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-forest/8 text-[10px] font-semibold text-forest">
                          {initials(patient.firstName, patient.lastName)}
                        </span>
                        <span>
                          <span className="block text-[13px] font-medium text-forest group-hover:text-clay">
                            {patient.firstName} {patient.lastName}
                          </span>
                          <span className="block text-[10.5px] text-muted">
                            {patient.referralSource
                              ? `Referred · ${patient.referralSource}`
                              : "No referral recorded"}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-forest/80 tabular-nums">
                      {age !== null ? `${age} yrs` : "—"}
                      <span className="block text-[10.5px] text-muted">
                        {patient.dateOfBirth
                          ? formatDate(patient.dateOfBirth, "UTC", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "DOB unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11.5px] text-forest/75">
                      {patient.phone ?? "—"}
                      <span className="block text-[10.5px] text-muted">{patient.email ?? ""}</span>
                    </td>
                    <td className="px-4 py-3 text-[11.5px] text-forest/75">
                      {patient.lastVisitAt
                        ? formatDate(patient.lastVisitAt, clinic.timezone, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11.5px] text-forest/80">
                        {patient.openPlanItems > 0
                          ? `${patient.openPlanItems} open`
                          : "None"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {patient.medicalAlerts.length > 0 ? (
                        <span className="inline-flex items-center rounded-full border border-[#8A4A4A]/25 bg-[#8A4A4A]/8 px-2 py-0.5 text-[10px] font-medium text-[#8A4A4A]">
                          {patient.medicalAlerts.length} alert
                          {patient.medicalAlerts.length > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-[10.5px] text-muted/60">Clear</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function PatientsSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-cream-50/80 p-5">
      <ListSkeleton rows={6} />
    </div>
  );
}
