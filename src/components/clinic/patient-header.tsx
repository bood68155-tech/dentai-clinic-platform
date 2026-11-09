import Link from "next/link";

import type { Patient } from "@/db/schema";
import { ageFrom, cn, formatDate, initials } from "@/lib/utils";

import { AlertBadge } from "./ui";

export function PatientHeader({
  patient,
  clinicName,
  timeZone,
  active,
}: {
  patient: Patient;
  clinicName: string;
  timeZone: string;
  active: "overview" | "chart" | "imaging";
}) {
  const age = ageFrom(patient.dateOfBirth);

  const tabs = [
    { key: "overview" as const, label: "Overview", href: `/clinic/patients/${patient.id}` },
    {
      key: "chart" as const,
      label: "Dental chart",
      href: `/clinic/patients/${patient.id}/chart`,
    },
    {
      key: "imaging" as const,
      label: "Imaging",
      href: `/clinic/patients/${patient.id}/imaging`,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-forest text-base font-medium text-cream">
            {initials(patient.firstName, patient.lastName)}
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-clay">
              {clinicName}
            </p>
            <h1 className="mt-1 font-display text-[clamp(1.6rem,2.8vw,2.1rem)] leading-none text-forest">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted">
              <span>
                {patient.dateOfBirth
                  ? formatDate(patient.dateOfBirth, "UTC", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "DOB not recorded"}
              </span>
              {age !== null ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{age} years</span>
                </>
              ) : null}
              {patient.gender ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{patient.gender.replace(/-/g, " ")}</span>
                </>
              ) : null}
              <span aria-hidden="true">·</span>
              <span className="capitalize">Record created {formatDate(patient.createdAt, timeZone)}</span>
            </p>
          </div>
        </div>

        {patient.medicalAlerts.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 sm:justify-end">
            {patient.medicalAlerts.map((alert) => (
              <AlertBadge key={alert}>{alert}</AlertBadge>
            ))}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[10px] font-medium text-muted">
            <span className="size-1.5 rounded-full bg-sage" />
            No medical alerts
          </span>
        )}
      </div>

      <nav className="flex items-center gap-1 border-b border-line" aria-label="Patient sections">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={active === tab.key ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 pb-2.5 pt-1 text-[12px] font-medium transition-colors",
              active === tab.key
                ? "border-forest text-forest"
                : "border-transparent text-muted hover:text-forest",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
