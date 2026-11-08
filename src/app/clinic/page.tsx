import Link from "next/link";
import { Suspense } from "react";

import { AgendaList } from "@/components/clinic/agenda-list";
import {
  DbNotice,
  EmptyState,
  ListSkeleton,
  PageHeader,
  Panel,
  Skeleton,
  StatCard,
} from "@/components/clinic/ui";
import { ArrowRight } from "@/components/icons";
import { getAgenda, getClinic, getClinicStats, listPatients } from "@/db/queries";
import { load } from "@/db/safe";
import {
  ageFrom,
  formatDate,
  formatMoney,
  formatTime,
  initials,
  todayIn,
} from "@/lib/utils";

export default function ClinicOverviewPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-7">
      <PageHeader
        eyebrow="Practice"
        title="Today at the clinic"
        description="Live view of the book, the charts on file and the patients in active care."
        actions={
          <Link
            href="/clinic/appointments"
            className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-[12px] font-medium text-cream transition-colors hover:bg-forest-700"
          >
            Open agenda
            <ArrowRight className="size-3.5" />
          </Link>
        }
      />

      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewContent />
      </Suspense>
    </div>
  );
}

async function OverviewContent() {
  const clinicResult = await load(getClinic);
  if (!clinicResult.ok) return <DbNotice error={clinicResult.error} />;

  const clinic = clinicResult.data;
  if (!clinic) {
    return (
      <EmptyState
        title="No clinic yet"
        body="Create the demo practice and its seed data to explore the platform."
        action={{ label: "Read the setup steps", href: "/clinic/patients" }}
      />
    );
  }

  const day = todayIn(clinic.timezone);
  const result = await load(() =>
    Promise.all([
      getClinicStats(clinic.id, day, clinic.timezone),
      getAgenda(clinic.id, day, clinic.timezone),
      listPatients(clinic.id),
    ]),
  );

  if (!result.ok) return <DbNotice error={result.error} />;

  const [stats, agenda, patients] = result.data;
  const patientBook = agenda.filter((item) => item.kind !== "lunch" && item.kind !== "break");
  const upcoming = patients
    .filter((patient) => patient.isActive)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Appointments today"
          value={stats.appointmentsToday}
          hint={formatDate(day, clinic.timezone, { weekday: "long", month: "long", day: "numeric" })}
        />
        <StatCard label="Patients in care" value={stats.patients} hint="Active records" />
        <StatCard
          label="Dental charts"
          value={stats.chartsRecorded}
          hint={`${stats.findings} tooth findings recorded`}
        />
        <StatCard
          label="Planned treatment"
          value={formatMoney(stats.planValue, clinic.currency)}
          hint="Awaiting acceptance"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Panel
          title="Today's book"
          description={`${patientBook.length} clinical appointments · ${clinic.name}`}
          action={
            <Link
              href="/clinic/appointments"
              className="text-[11px] font-medium text-forest/60 transition-colors hover:text-forest"
            >
              Full agenda
            </Link>
          }
        >
          <AgendaList
            items={agenda}
            timeZone={clinic.timezone}
            emptyTitle="A quiet day"
            emptyBody="Nothing is booked yet. Appointments added to the agenda will appear here."
          />
        </Panel>

        <div className="space-y-4">
          <Panel title="Recently added" description="Newest patient records">
            {upcoming.length === 0 ? (
              <p className="py-2 text-[12px] text-muted">No patients on file yet.</p>
            ) : (
              <ul className="divide-y divide-line/70">
                {upcoming.map((patient) => {
                  const age = ageFrom(patient.dateOfBirth);
                  return (
                    <li key={patient.id}>
                      <Link
                        href={`/clinic/patients/${patient.id}`}
                        className="group flex items-center gap-3 py-2.5"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-forest/8 text-[10px] font-semibold text-forest">
                          {initials(patient.firstName, patient.lastName)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-medium text-forest group-hover:text-clay">
                            {patient.firstName} {patient.lastName}
                          </span>
                          <span className="block text-[10.5px] text-muted">
                            {age !== null ? `${age} yrs` : "Age unknown"}
                            {patient.medicalAlerts.length > 0
                              ? ` · ${patient.medicalAlerts.length} alert${
                                  patient.medicalAlerts.length > 1 ? "s" : ""
                                }`
                              : ""}
                          </span>
                        </span>
                        <span className="text-[10px] text-muted/60 tabular-nums">
                          {formatTime(patient.createdAt, clinic.timezone)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel
            title="Chart coverage"
            description="Odontograms recorded per patient"
          >
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <p className="font-display text-2xl text-forest tabular-nums">
                  {stats.chartsRecorded}
                  <span className="ml-1 text-[11px] font-sans text-muted">
                    / {stats.patients} patients
                  </span>
                </p>
                <span className="text-[10px] font-medium text-muted">
                  {stats.patients > 0
                    ? `${Math.round((stats.chartsRecorded / stats.patients) * 100)}%`
                    : "0%"}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-sand/60">
                <div
                  className="h-full rounded-full bg-forest"
                  style={{
                    width: `${
                      stats.patients > 0
                        ? Math.min(100, Math.round((stats.chartsRecorded / stats.patients) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-[11px] leading-relaxed text-muted">
                Charts use FDI numbering, recording caries, restorations, endodontics,
                implants and missing teeth per surface.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-7">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[6.5rem] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-line bg-cream-50/80 p-5">
          <Skeleton className="mb-4 h-3 w-28" />
          <ListSkeleton rows={4} />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
