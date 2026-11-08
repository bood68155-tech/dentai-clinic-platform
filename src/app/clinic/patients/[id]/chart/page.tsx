import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Odontogram, type ChartFindingView } from "@/components/clinic/odontogram";
import { PatientHeader } from "@/components/clinic/patient-header";
import {
  DbNotice,
  EmptyState,
  PageHeader,
  Panel,
  Skeleton,
} from "@/components/clinic/ui";
import { ChevronLeft } from "@/components/icons";
import type { Patient } from "@/db/schema";
import { getClinic, getPatient, getPatientChart } from "@/db/queries";
import { load } from "@/db/safe";
import { requireStaffUser } from "@/lib/auth";
import { formatDate, formatTime } from "@/lib/utils";

export const metadata = { title: "Dental chart" };

export default async function PatientChartPage(
  props: PageProps<"/clinic/patients/[id]/chart">,
) {
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

      <Suspense fallback={<ChartSkeleton />}>
        <ChartContent patientId={id} />
      </Suspense>
    </div>
  );
}

async function ChartContent({ patientId }: { patientId: string }) {
  const result = await load(async () => {
    const clinic = await getClinic();
    if (!clinic) return null;
    const patient = await getPatient(clinic.id, patientId);
    if (!patient) return { clinic, patient: null as Patient | null, chart: null };
    return { clinic, patient, chart: await getPatientChart(patient.id) };
  });

  if (!result.ok) return <DbNotice error={result.error} />;
  if (!result.data) {
    return (
      <EmptyState
        title="No clinic yet"
        body="Seed the practice before opening dental charts."
        action={{ label: "Back to patients", href: "/clinic/patients" }}
      />
    );
  }

  const { clinic, patient, chart } = result.data;
  if (!patient || !chart) notFound();

  const findings: ChartFindingView[] = chart.findings.map((finding) => ({
    id: finding.id,
    tooth: finding.tooth,
    condition: finding.condition,
    surfaces: finding.surfaces,
    status: finding.status,
    notes: finding.notes,
    recordedAtLabel: formatDate(finding.recordedAt, clinic.timezone, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    recordedBy: finding.recordedBy,
  }));

  const teethAffected = new Set(findings.map((finding) => finding.tooth)).size;

  return (
    <>
      <PatientHeader
        patient={patient}
        clinicName={clinic.name}
        timeZone={clinic.timezone}
        active="chart"
      />

      <PageHeader
        eyebrow="Odontogram"
        title="Dental chart"
        description={
          chart.recordedAt
            ? `Last charted ${formatDate(chart.recordedAt, clinic.timezone, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })} at ${formatTime(chart.recordedAt, clinic.timezone)} · ${findings.length} findings across ${teethAffected} teeth.`
            : "No chart recorded yet — select a tooth below to begin."
        }
      />

      <Suspense fallback={<Skeleton className="h-72 rounded-2xl" />}>
        <Odontogram patientId={patient.id} findings={findings} />
      </Suspense>

      <Panel title="Chart history" description="Newest first" bodyClassName="p-0">
        {findings.length === 0 ? (
          <p className="px-5 py-4 text-[12px] text-muted">
            Nothing recorded. Findings added above are appended to this patient&apos;s
            chart with the recording clinician and timestamp.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line/80 text-[9px] uppercase tracking-[0.16em] text-muted">
                  <th className="px-5 py-2.5 font-semibold">Tooth</th>
                  <th className="px-4 py-2.5 font-semibold">Finding</th>
                  <th className="px-4 py-2.5 font-semibold">Surfaces</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">Recorded</th>
                  <th className="px-5 py-2.5 font-semibold">Clinician</th>
                </tr>
              </thead>
              <tbody>
                {[...findings].reverse().map((finding) => (
                  <tr key={finding.id} className="border-b border-line/50 last:border-0">
                    <td className="px-5 py-2.5 text-[12px] font-medium text-forest tabular-nums">
                      {finding.tooth}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] capitalize text-forest/80">
                      {finding.condition}
                      {finding.notes ? (
                        <span className="block text-[10.5px] text-muted">{finding.notes}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 text-[11.5px] text-forest/70">
                      {finding.surfaces.length > 0 ? finding.surfaces.join(", ") : "Whole tooth"}
                    </td>
                    <td className="px-4 py-2.5 text-[11.5px] capitalize text-forest/70">
                      {finding.status}
                    </td>
                    <td className="px-4 py-2.5 text-[11.5px] text-forest/70">
                      {finding.recordedAtLabel}
                    </td>
                    <td className="px-5 py-2.5 text-[11.5px] text-forest/70">
                      {finding.recordedBy ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-72 rounded-2xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}
