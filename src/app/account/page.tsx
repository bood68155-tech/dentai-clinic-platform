import Link from "next/link";
import { Suspense } from "react";

import { ArrowRight, ClockIcon, ToothMark } from "@/components/icons";
import { DbNotice, EmptyState, StatusBadge } from "@/components/clinic/ui";
import { getAccountDashboard, getClinic } from "@/db/queries";
import { load } from "@/db/safe";
import { requirePatientUser } from "@/lib/auth";
import { formatDate, formatMoney, formatTimeRange } from "@/lib/utils";

export const metadata = {
  title: "My visits",
};

export default async function AccountPage() {
  const user = await requirePatientUser();

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-clay">
          My visits
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-[0.98] text-forest">
          Hello, {firstNameOf(user.fullName)}.
        </h1>
        <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-muted">
          Everything we have booked for you, and the treatment we have agreed
          together. For anything else, call us — we always answer.
        </p>
      </header>

      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard patientId={user.patientId} />
      </Suspense>
    </div>
  );
}

function firstNameOf(fullName: string): string {
  return fullName.trim().split(" ")[0] ?? fullName;
}

async function Dashboard({ patientId }: { patientId: string | null }) {
  const result = await load(async () => {
    const [clinic, dashboard] = await Promise.all([
      getClinic(),
      getAccountDashboard(patientId),
    ]);
    return { clinic, ...dashboard };
  });

  if (!result.ok) {
    return <DbNotice error={result.error} />;
  }

  const { patient, upcoming, recent, plan, chartSummary, clinic } = result.data;
  const timeZone = clinic?.timezone ?? "UTC";
  const currency = clinic?.currency ?? "USD";

  if (!patient) {
    return (
      <EmptyState
        title="No linked record yet"
        body="Your account is not linked to a patient record. Book a visit with this email address and we will link it automatically — or ask the front desk to connect it for you."
        action={{ label: "Book a visit", href: "/book" }}
      />
    );
  }

  const next = upcoming[0] ?? null;
  const planTotal = plan.reduce((sum, item) => sum + Number(item.fee), 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        {/* Next visit */}
        <section className="rounded-[1.75rem] border border-forest/15 bg-forest p-6 text-cream shadow-[0_28px_60px_-38px_rgba(23,81,54,0.8)] lg:p-8" aria-label="Next visit">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream/60">
            Next visit
          </p>
          {next ? (
            <>
              <p className="mt-3 font-display text-3xl leading-tight">
                {formatDate(next.startsAt, timeZone, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-cream/80">
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="size-4" />
                  {formatTimeRange(next.startsAt, next.endsAt, timeZone)}
                </span>
                {next.practitionerName ? <span>with {next.practitionerName}</span> : null}
                {next.treatmentName ? <span>· {next.treatmentName}</span> : null}
              </p>
              {next.reason ? (
                <p className="mt-3 text-[12px] text-cream/70">{next.reason}</p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2">
                <StatusBadge status={next.status} />
                {next.operatoryName ? (
                  <span className="inline-flex items-center rounded-full border border-cream/30 px-2.5 py-0.5 text-[10px] font-medium text-cream/80">
                    {next.operatoryName}
                  </span>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 font-display text-2xl leading-snug">
                Nothing booked yet.
              </p>
              <p className="mt-2 text-[12.5px] text-cream/70">
                Check-ups every six months keep small things small.
              </p>
            </>
          )}

          <Link
            href="/book"
            className="btn btn-light btn-sm mt-6"
          >
            Book a visit
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </section>

        {/* Upcoming */}
        <section aria-label="Upcoming visits" className="surface p-6 lg:p-7">
          <h2 className="font-display text-xl text-forest">Upcoming</h2>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-[12.5px] text-muted">
              No upcoming visits on the books.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line/70">
              {upcoming.map((appointment) => (
                <li key={appointment.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-forest">
                      {appointment.treatmentName ?? appointment.title ?? "Visit"}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-muted">
                      {formatDate(appointment.startsAt, timeZone)} ·{" "}
                      {formatTimeRange(appointment.startsAt, appointment.endsAt, timeZone)}
                      {appointment.practitionerName
                        ? ` · ${appointment.practitionerName}`
                        : ""}
                    </p>
                  </div>
                  <StatusBadge status={appointment.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent visits */}
        <section aria-label="Recent visits" className="surface p-6 lg:p-7">
          <h2 className="font-display text-xl text-forest">Recent visits</h2>
          {recent.length === 0 ? (
            <p className="mt-3 text-[12.5px] text-muted">
              No completed visits yet — we will see you soon.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line/70">
              {recent.map((appointment) => (
                <li key={appointment.id} className="py-3.5">
                  <p className="text-[13px] font-medium text-forest">
                    {appointment.treatmentName ?? appointment.title ?? "Visit"}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    {formatDate(appointment.startsAt, timeZone)}
                    {appointment.practitionerName
                      ? ` · ${appointment.practitionerName}`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="space-y-6">
        {/* Record */}
        <section aria-label="Your record" className="surface p-6 lg:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-forest text-cream">
              <ToothMark className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-xl leading-tight text-forest">
                {patient.firstName} {patient.lastName}
              </h2>
              <p className="text-[11px] text-muted">
                Patient record · {clinic?.name ?? "NUV"}
              </p>
            </div>
          </div>
          <dl className="mt-5 space-y-2.5 text-[12.5px]">
            {patient.email ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Email</dt>
                <dd className="text-forest">{patient.email}</dd>
              </div>
            ) : null}
            {patient.phone ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Phone</dt>
                <dd className="text-forest">{patient.phone}</dd>
              </div>
            ) : null}
            {patient.insuranceCarrier ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Insurance</dt>
                <dd className="text-forest">{patient.insuranceCarrier}</dd>
              </div>
            ) : null}
          </dl>
          {chartSummary ? (
            <p className="mt-5 border-t border-line/80 pt-4 text-[11.5px] leading-relaxed text-muted">
              Latest chart {formatDate(chartSummary.recordedAt, timeZone)} ·{" "}
              {chartSummary.findings} findings on file.
              {chartSummary.notes ? ` ${chartSummary.notes}` : ""}
            </p>
          ) : null}
        </section>

        {/* Treatment plan */}
        <section aria-label="Treatment plan" className="surface p-6 lg:p-7">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-display text-xl text-forest">Treatment plan</h2>
            {plan.length > 0 ? (
              <p className="font-display text-lg text-clay">
                {formatMoney(String(planTotal), currency)}
              </p>
            ) : null}
          </div>
          {plan.length === 0 ? (
            <p className="mt-3 text-[12.5px] text-muted">
              No planned treatment right now — your teeth are in good shape.
            </p>
          ) : (
            <ol className="mt-4 space-y-4">
              {plan.map((item, index) => (
                <li key={item.id} className="flex gap-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-forest/20 text-[11px] font-semibold text-forest">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-[13px] font-medium text-forest">
                        {item.treatmentName ?? "Treatment"}
                        {item.tooth ? ` · tooth ${item.tooth}` : ""}
                      </p>
                      <StatusBadge status={item.status} />
                    </div>
                    {item.notes ? (
                      <p className="mt-1 text-[11.5px] text-muted">{item.notes}</p>
                    ) : null}
                    <p className="mt-1 text-[11.5px] font-medium text-forest/80">
                      {formatMoney(item.fee, currency)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]" aria-hidden="true">
      <div className="space-y-6">
        <div className="h-44 animate-pulse rounded-[1.75rem] bg-sand/50" />
        <div className="h-48 animate-pulse rounded-[1.75rem] bg-sand/40" />
      </div>
      <div className="space-y-6">
        <div className="h-56 animate-pulse rounded-[1.75rem] bg-sand/40" />
        <div className="h-48 animate-pulse rounded-[1.75rem] bg-sand/40" />
      </div>
    </div>
  );
}
