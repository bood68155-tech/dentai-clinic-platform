import Link from "next/link";
import { Suspense } from "react";

import { BookingForm } from "@/components/marketing/booking-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CheckIcon, ChevronLeft, ClockIcon, PhoneIcon } from "@/components/icons";
import { getClinic, getNextOpening, listTreatmentTypes } from "@/db/queries";
import { load } from "@/db/safe";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";
import { todayIn } from "@/lib/time";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Book a visit",
  description:
    "Request an appointment at Dentai in SoHo, New York. We confirm every request by phone or email.",
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

export default function BookPage(props: {
  searchParams: Promise<{ date?: string; time?: string; treatment?: string }>;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main id="main" className="flex-1">
        <div className="mx-auto grid w-full max-w-[82rem] gap-12 px-6 py-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-10 lg:py-24">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted transition-colors hover:text-forest"
            >
              <ChevronLeft className="size-3.5" />
              Back to the clinic
            </Link>

            <p className="eyebrow mt-8">Appointments</p>
            <h1 className="mt-5 max-w-[10ch] font-display text-[clamp(2.8rem,5vw,4.6rem)] font-extrabold leading-[0.9] tracking-[-0.065em] text-forest">
              Book a visit.
            </h1>
            <p className="font-editorial mt-5 max-w-md text-[1.08rem] leading-[1.55] text-muted sm:text-[1.16rem]">
              Choose a time that suits you and we will confirm it personally. First
              visits are 45 minutes, so there is room to talk before anyone picks up an
              instrument.
            </p>

            <ul className="mt-8 space-y-3 text-[12.5px] text-forest/80">
              {[
                "No payment taken online",
                "Confirmation by phone or email",
                "New patients and emergencies welcome",
                "Insurance checked before your visit",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-forest-500" />
                  {item}
                </li>
              ))}
            </ul>

            <Suspense fallback={<OpeningHint when="Checking the practice calendar…" />}>
              <NextOpeningHint />
            </Suspense>

            <div className="mt-8 space-y-2.5 border-t border-line pt-6 text-[12px] text-muted">
              <a
                href={CLINIC_PROFILE.phoneHref}
                className="flex items-center gap-2.5 text-forest transition-colors hover:text-clay"
              >
                <PhoneIcon className="size-4 text-clay" />
                {CLINIC_PROFILE.phone}
              </a>
              <p className="flex items-center gap-2.5">
                <ClockIcon className="size-4 text-clay" />
                Mon–Fri 09:00–18:00 · Sat 09:00–13:00
              </p>
            </div>
          </div>

          <Suspense fallback={<FormSkeleton />}>
            <BookingPanel searchParams={props.searchParams} />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function OpeningHint({ when }: { when: string }) {
  return (
    <div className="mt-8 rounded-2xl border border-forest/15 bg-cream-50 px-5 py-4">
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted">
        Next opening
      </p>
      <p className="mt-1 font-display text-base text-forest">{when}</p>
    </div>
  );
}

async function NextOpeningHint() {
  const result = await load(async () => {
    const clinic = await getClinic();
    if (!clinic) return null;
    return { clinic, opening: await getNextOpening(clinic.id, clinic.timezone) };
  });

  if (!result.ok || !result.data?.opening) {
    return <OpeningHint when="Call the clinic to find the next free chair" />;
  }

  const { clinic, opening } = result.data;

  return (
    <OpeningHint
      when={formatDate(opening.startsAt, clinic.timezone, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })}
    />
  );
}

async function BookingPanel({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; time?: string; treatment?: string }>;
}) {
  const { date, time } = await searchParams;

  const result = await load(async () => {
    const clinic = await getClinic();
    if (!clinic) return null;
    return { clinic, treatments: await listTreatmentTypes(clinic.id) };
  });

  if (!result.ok || !result.data) {
    return (
      <div className="surface p-7 lg:p-9">
        <h2 className="font-display text-[1.7rem] font-extrabold tracking-[-0.05em] text-forest">
          Online booking is offline
        </h2>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          The practice calendar is not connected yet. Call{" "}
          <a href={CLINIC_PROFILE.phoneHref} className="text-forest underline underline-offset-4">
            {CLINIC_PROFILE.phone}
          </a>{" "}
          and we will book you in.
        </p>
      </div>
    );
  }

  const { clinic, treatments } = result.data;
  const today = todayIn(clinic.timezone);

  return (
    <BookingForm
      treatments={treatments.map((treatment) => ({
        id: treatment.id,
        code: treatment.code,
        name: treatment.name,
        durationMinutes: treatment.durationMinutes,
      }))}
      minDate={today}
      defaultDate={date && DATE_PATTERN.test(date) ? date : today}
      defaultTime={time && TIME_PATTERN.test(time) ? time : "09:00"}
    />
  );
}

function FormSkeleton() {
  return (
    <div className="surface p-7 lg:p-9">
      <div className="h-6 w-56 animate-pulse rounded bg-sand/60" />
      <div className="mt-3 h-3 w-72 animate-pulse rounded bg-sand/50" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-11 animate-pulse rounded-xl bg-sand/40" />
        ))}
      </div>
      <div className="mt-6 h-11 w-44 animate-pulse rounded-full bg-sand/50" />
    </div>
  );
}
