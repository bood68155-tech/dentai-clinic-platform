import Link from "next/link";
import { Suspense } from "react";

import { ArrowRight, ClockIcon } from "@/components/icons";
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
    <div className="border border-ink bg-paper p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[8.5px] font-extrabold uppercase tracking-[0.2em] text-clay">
            Next available
          </p>
          <p className="mt-1.5 font-display text-[1.05rem] font-extrabold leading-tight tracking-[-0.04em] text-forest">
            {when}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 border border-ink/25 px-2.5 py-1 text-[9px] font-bold text-forest/60">
          <ClockIcon className="size-3" />
          45 min
        </span>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {times.map((time) => (
          <div
            key={time}
            className={`border px-1 py-2 text-center text-[10px] font-semibold tabular-nums ${
              time === active
                ? "border-forest bg-forest text-paper"
                : "border-ink/20 text-ink/60"
            }`}
          >
            {time}
          </div>
        ))}
      </div>

      <div className="mt-3.5 flex items-end justify-between gap-4">
        <p className="max-w-[15rem] text-[10px] leading-relaxed text-muted">{note}</p>
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-[10.5px] font-extrabold text-forest transition-colors hover:text-clay"
        >
          Take this time
          <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
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
  );
}
