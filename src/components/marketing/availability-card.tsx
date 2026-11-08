import Link from "next/link";
import { Suspense } from "react";

import { ArrowRight, ClockIcon, ToothMark } from "@/components/icons";
import { getClinic, getNextOpening } from "@/db/queries";
import { load } from "@/db/safe";
import { OPENING_HOURS, weekdayIndex } from "@/lib/time";
import { formatDate } from "@/lib/utils";

const FALLBACK_TIMES = ["09:00", "10:30", "13:00", "15:00"];

function CardBody({
  when,
  note,
  times,
  active,
  href,
}: {
  when: string;
  note: string;
  times: string[];
  active?: string;
  href: string;
}) {
  return (
    <div className="rounded-2xl border border-forest/10 bg-cream-50/95 p-5 shadow-[0_18px_40px_-24px_rgba(22,51,42,0.55)] backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-forest text-cream">
            <ToothMark className="size-5" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              Next available
            </p>
            <p className="font-display text-lg leading-tight text-forest">{when}</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-forest/60">
          <ClockIcon className="size-3.5" />
          45 min
        </span>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {times.map((time) => (
          <div
            key={time}
            className={`rounded-lg border px-1 py-2 text-center text-[11px] tabular-nums ${
              time === active
                ? "border-forest bg-forest text-cream"
                : "border-forest/15 text-forest/55"
            }`}
          >
            {time}
          </div>
        ))}
      </div>

      <p className="mt-3.5 text-[11px] leading-relaxed text-muted">{note}</p>

      <Link
        href={href}
        className="group mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-forest transition-colors hover:text-clay"
      >
        Take this time
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

async function LiveAvailability() {
  const result = await load(async () => {
    const clinic = await getClinic();
    if (!clinic) return null;
    return { clinic, opening: await getNextOpening(clinic.id, clinic.timezone) };
  });

  if (!result.ok || !result.data) {
    return (
      <CardBody
        when="Call the clinic"
        note="Online booking is not connected yet. Call +1 (212) 555-0184 and we will find you a time."
        times={FALLBACK_TIMES}
        href="/book"
      />
    );
  }

  const { clinic, opening } = result.data;

  if (!opening) {
    return (
      <CardBody
        when="Fully booked"
        note={`${clinic.name} is booked out for the next ten days. Send a request and we will call if a chair opens up.`}
        times={FALLBACK_TIMES}
        href="/book"
      />
    );
  }

  const times = OPENING_HOURS[weekdayIndex(opening.day)] ?? FALLBACK_TIMES;

  return (
    <CardBody
      when={`${formatDate(opening.startsAt, clinic.timezone, {
        weekday: "short",
        day: "numeric",
        month: "short",
      })} · ${opening.time}`}
      note={`${clinic.address ?? "SoHo, New York"} · first visit is 45 minutes`}
      times={times.slice(0, 5)}
      active={opening.time}
      href={`/book?date=${opening.day}&time=${opening.time}`}
    />
  );
}

export function AvailabilityCard() {
  return (
    <div className="absolute inset-x-6 bottom-6">
      <Suspense
        fallback={
          <CardBody
            when="Checking the book…"
            note="Live availability from the practice calendar."
            times={FALLBACK_TIMES}
            href="/book"
          />
        }
      >
        <LiveAvailability />
      </Suspense>
    </div>
  );
}
