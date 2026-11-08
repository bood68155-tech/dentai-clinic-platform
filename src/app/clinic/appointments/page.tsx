import Link from "next/link";
import { Suspense } from "react";

import { AgendaList } from "@/components/clinic/agenda-list";
import {
  DbNotice,
  EmptyState,
  PageHeader,
  Panel,
  Skeleton,
  StatCard,
} from "@/components/clinic/ui";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import { getAgenda, getClinic } from "@/db/queries";
import { load } from "@/db/safe";
import { requireStaffUser } from "@/lib/auth";
import {
  cn,
  formatDate,
  formatTime,
  shiftDay,
  todayIn,
} from "@/lib/utils";

export const metadata = { title: "Appointments" };

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default async function AppointmentsPage(props: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireStaffUser();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-7">
      <PageHeader
        eyebrow="Agenda"
        title="Appointments"
        description="One day at a time, across every treatment suite and clinician."
      />

      <Suspense fallback={<AgendaSkeleton />}>
        <AgendaContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function AgendaContent({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const result = await load(async () => {
    const clinic = await getClinic();
    if (!clinic) return null;
    const day = date && DAY_PATTERN.test(date) ? date : todayIn(clinic.timezone);
    return { clinic, day, agenda: await getAgenda(clinic.id, day, clinic.timezone) };
  });

  if (!result.ok) return <DbNotice error={result.error} />;
  if (!result.data) {
    return (
      <EmptyState
        title="No clinic yet"
        body="Seed the practice to populate the agenda."
        action={{ label: "Go to patients", href: "/clinic/patients" }}
      />
    );
  }

  const { clinic, day, agenda } = result.data;
  const today = todayIn(clinic.timezone);
  const clinical = agenda.filter((item) => item.patientId);
  const rooms = new Map<string, number>();
  const clinicians = new Map<string, number>();

  for (const item of clinical) {
    if (item.operatoryName) rooms.set(item.operatoryName, (rooms.get(item.operatoryName) ?? 0) + 1);
    if (item.practitionerName) {
      clinicians.set(item.practitionerName, (clinicians.get(item.practitionerName) ?? 0) + 1);
    }
  }

  const first = clinical[0];
  const last = clinical.at(-1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-cream-50/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/clinic/appointments?date=${shiftDay(day, -1)}`}
            aria-label="Previous day"
            className="grid size-8 place-items-center rounded-full border border-line text-forest/60 transition-colors hover:border-forest/30 hover:text-forest"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link
            href={`/clinic/appointments?date=${shiftDay(day, 1)}`}
            aria-label="Next day"
            className="grid size-8 place-items-center rounded-full border border-line text-forest/60 transition-colors hover:border-forest/30 hover:text-forest"
          >
            <ChevronRight className="size-4" />
          </Link>
          <div className="ml-2">
            <p className="font-display text-lg leading-tight text-forest">
              {formatDate(day, clinic.timezone, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <p className="text-[10.5px] text-muted">
              {day === today ? "Today" : "Scheduled book"} · {clinic.timezone.replace("_", " ")}
            </p>
          </div>
        </div>

        <Link
          href="/clinic/appointments"
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition-colors",
            day === today
              ? "border-line text-muted"
              : "border-forest/20 text-forest hover:border-forest/40",
          )}
        >
          Today
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Clinical slots" value={clinical.length} hint="Excludes breaks and blocks" />
        <StatCard
          label="First appointment"
          value={first ? formatTime(first.startsAt, clinic.timezone) : "—"}
          hint={first?.patientFirstName ?? "Nothing booked"}
        />
        <StatCard
          label="Last appointment"
          value={last ? formatTime(last.endsAt, clinic.timezone) : "—"}
          hint={last?.patientFirstName ?? "Nothing booked"}
        />
        <StatCard
          label="Rooms in use"
          value={rooms.size}
          hint={`${clinicians.size} clinician${clinicians.size === 1 ? "" : "s"}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Panel
          title="Day book"
          description={`${agenda.length} entries including blocks`}
        >
          <AgendaList
            items={agenda}
            timeZone={clinic.timezone}
            emptyTitle="Nothing booked"
            emptyBody="This day is clear. Move to another date or add appointments through the agenda."
          />
        </Panel>

        <div className="space-y-4">
          <Panel title="Rooms" description="Appointments per suite">
            {rooms.size === 0 ? (
              <p className="text-[12px] text-muted">No rooms booked today.</p>
            ) : (
              <ul className="space-y-2.5">
                {[...rooms.entries()].map(([room, count]) => (
                  <li key={room} className="flex items-center justify-between gap-3">
                    <span className="truncate text-[12px] text-forest/80">{room}</span>
                    <span className="text-[11px] text-muted tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Clinicians" description="Scheduled chairs">
            {clinicians.size === 0 ? (
              <p className="text-[12px] text-muted">Nobody scheduled.</p>
            ) : (
              <ul className="space-y-2.5">
                {[...clinicians.entries()].map(([name, count]) => (
                  <li key={name} className="flex items-center justify-between gap-3">
                    <span className="truncate text-[12px] text-forest/80">{name}</span>
                    <span className="text-[11px] text-muted tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className="rounded-2xl border border-dashed border-line px-4 py-4">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">
              Next up
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
              Appointment creation, drag-to-reschedule and recall reminders are wired to
              the same schema — the `appointments` table is ready for them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgendaSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[6.5rem] rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
