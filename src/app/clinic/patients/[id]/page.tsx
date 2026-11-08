import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PatientHeader } from "@/components/clinic/patient-header";
import {
  DbNotice,
  EmptyState,
  ListSkeleton,
  Panel,
  Skeleton,
  StatusBadge,
} from "@/components/clinic/ui";
import { ArrowRight, ChevronLeft } from "@/components/icons";
import {
  getClinic,
  getPatient,
  getPatientChart,
  getPatientNotes,
  getPatientPlan,
  type PatientChart,
  type PatientNote,
  type PlanItem,
} from "@/db/queries";
import { load } from "@/db/safe";
import type { Patient } from "@/db/schema";
import { requireStaffUser } from "@/lib/auth";
import { ageFrom, formatDate, formatMoney } from "@/lib/utils";

export default async function PatientPage(props: PageProps<"/clinic/patients/[id]">) {
  await requireStaffUser();
  const { id } = await props.params;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Link
        href="/clinic/patients"
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted transition-colors hover:text-forest"
      >
        <ChevronLeft className="size-3.5" />
        All patients
      </Link>

      <Suspense fallback={<PatientSkeleton />}>
        <PatientContent patientId={id} />
      </Suspense>
    </div>
  );
}

type PatientRecord = {
  clinic: NonNullable<Awaited<ReturnType<typeof getClinic>>>;
  patient: Patient;
  chart: PatientChart;
  plan: PlanItem[];
  notes: PatientNote[];
};

async function PatientContent({ patientId }: { patientId: string }) {
  const result = await load<{ kind: "no-clinic" } | { kind: "missing" } | ({ kind: "ok" } & PatientRecord)>(
    async () => {
      const clinic = await getClinic();
      if (!clinic) return { kind: "no-clinic" } as const;

      const patient = await getPatient(clinic.id, patientId);
      if (!patient) return { kind: "missing" } as const;

      const [chart, plan, notes] = await Promise.all([
        getPatientChart(patient.id),
        getPatientPlan(patient.id),
        getPatientNotes(patient.id),
      ]);

      return { kind: "ok" as const, clinic, patient, chart, plan, notes };
    },
  );

  if (!result.ok) return <DbNotice error={result.error} />;

  if (result.data.kind === "no-clinic") {
    return (
      <EmptyState
        title="No clinic yet"
        body="Seed the practice before opening patient records."
        action={{ label: "Back to patients", href: "/clinic/patients" }}
      />
    );
  }

  if (result.data.kind === "missing") notFound();

  const { clinic, patient, chart, plan, notes } = result.data;

  const age = ageFrom(patient.dateOfBirth);
  const planTotal = plan.reduce((total, item) => total + Number(item.fee), 0);
  const openPlan = plan.filter((item) => item.status === "planned" || item.status === "accepted");

  return (
    <>
      <PatientHeader
        patient={patient}
        clinicName={clinic.name}
        timeZone={clinic.timezone}
        active="overview"
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Panel title="Contact & identity">
            <dl className="grid gap-x-6 gap-y-4 text-[12.5px] sm:grid-cols-2">
              <Detail label="Phone" value={patient.phone} />
              <Detail label="Email" value={patient.email} />
              <Detail label="Address" value={patient.address} className="sm:col-span-2" />
              <Detail label="Occupation" value={patient.occupation} />
              <Detail label="Referral" value={patient.referralSource} />
              <Detail label="Insurance" value={patient.insuranceCarrier} />
              <Detail label="Member ID" value={patient.insuranceMemberId} />
            </dl>
          </Panel>

          <Panel
            title="Medical file"
            description="Alerts are shown beside the patient name across the platform."
          >
            <div className="space-y-4 text-[12.5px]">
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Alerts
                </p>
                {patient.medicalAlerts.length === 0 ? (
                  <p className="mt-1.5 text-muted">No alerts recorded.</p>
                ) : (
                  <ul className="mt-1.5 list-inside list-disc space-y-1 text-forest/80">
                    {patient.medicalAlerts.map((alert) => (
                      <li key={alert}>{alert}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Allergies
                </p>
                <p className="mt-1.5 text-forest/80">{patient.allergies ?? "None recorded."}</p>
              </div>
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Notes
                </p>
                <p className="mt-1.5 leading-relaxed text-forest/80">
                  {patient.medicalNotes ?? patient.notes ?? "No notes recorded."}
                </p>
              </div>
            </div>
          </Panel>

          <Panel
            title="Treatment plan"
            description={`${openPlan.length} open item${openPlan.length === 1 ? "" : "s"}`}
            action={
              <span className="text-[11px] text-muted tabular-nums">
                {formatMoney(planTotal, clinic.currency)} total
              </span>
            }
            bodyClassName="p-0"
          >
            {plan.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="No plan yet"
                  body="Accepted and planned treatment will appear here once charted."
                />
              </div>
            ) : (
              <ul className="divide-y divide-line/70">
                {plan.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="w-6 text-[10px] text-muted tabular-nums">
                      {String(item.sequence).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium text-forest">
                        {item.treatmentName ?? "Custom treatment"}
                      </p>
                      <p className="text-[10.5px] text-muted">
                        {item.tooth ? `Tooth ${item.tooth}` : "Full mouth"}
                        {item.treatmentCode ? ` · ${item.treatmentCode}` : ""}
                        {item.notes ? ` · ${item.notes}` : ""}
                      </p>
                    </div>
                    <span className="text-[11.5px] text-forest/80 tabular-nums">
                      {formatMoney(item.fee, clinic.currency)}
                    </span>
                    <StatusBadge status={item.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Clinical notes" description="Most recent first">
            {notes.length === 0 ? (
              <p className="py-2 text-[12px] text-muted">No clinical notes recorded.</p>
            ) : (
              <ol className="space-y-4">
                {notes.map((note) => (
                  <li key={note.id} className="border-l border-line pl-4">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
                      {formatDate(note.notedAt, clinic.timezone, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {note.authorName ? ` · ${note.authorName}` : ""}
                    </p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-forest/80">{note.body}</p>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="At a glance">
            <dl className="grid grid-cols-2 gap-4 text-[12px]">
              <div>
                <dt className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Age
                </dt>
                <dd className="mt-1 font-display text-xl text-forest">
                  {age !== null ? age : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Findings
                </dt>
                <dd className="mt-1 font-display text-xl text-forest">
                  {chart.findings.length}
                </dd>
              </div>
              <div>
                <dt className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Open plan
                </dt>
                <dd className="mt-1 text-forest/80 tabular-nums">
                  {formatMoney(
                    openPlan.reduce((total, item) => total + Number(item.fee), 0),
                    clinic.currency,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Charted
                </dt>
                <dd className="mt-1 text-forest/80">
                  {chart.recordedAt
                    ? formatDate(chart.recordedAt, clinic.timezone, {
                        day: "numeric",
                        month: "short",
                      })
                    : "Not charted"}
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Odontogram" description="FDI notation · 32 permanent teeth">
            {chart.findings.length === 0 ? (
              <p className="text-[12px] leading-relaxed text-muted">
                This patient has no dental findings recorded yet.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {Object.entries(chart.byCondition).map(([condition, count]) => (
                  <li
                    key={condition}
                    className="flex items-center justify-between text-[12px] text-forest/80"
                  >
                    <span className="capitalize">{condition}</span>
                    <span className="tabular-nums text-muted">{count}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={`/clinic/patients/${patient.id}/chart`}
              className="group mt-4 flex items-center justify-between rounded-xl border border-forest/15 px-4 py-2.5 text-[11.5px] font-medium text-forest transition-colors hover:border-forest/35"
            >
              Open dental chart
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Detail({
  label,
  value,
  className,
}: {
  label: string;
  value: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-forest/85">{value ?? "—"}</dd>
    </div>
  );
}

function PatientSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-72 rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
        <ListSkeleton rows={3} />
      </div>
    </div>
  );
}
