"use client";

import Image from "next/image";
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { bookAppointmentAction } from "@/app/book/actions";
import { CheckIcon } from "@/components/icons";
import { RollingChip, RollingLabel } from "@/components/rolling-label";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";
import { initialBookingState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

const TZ = "America/New_York";
const SLOT_MINUTES = 45;
const DAYS_AHEAD = 60;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_INITIALS = ["M", "T", "W", "T", "F", "S", "S"];

type Day = { y: number; m: number; d: number };

function todayInClinic(): Day {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, m, d] = parts.split("-").map(Number);
  return { y, m: m - 1, d };
}

function iso(day: Day): string {
  return `${day.y}-${String(day.m + 1).padStart(2, "0")}-${String(day.d).padStart(2, "0")}`;
}

function weekdayOf(day: Day): number {
  return new Date(Date.UTC(day.y, day.m, day.d, 12)).getUTCDay();
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Monday-first grid offset. */
function monthOffset(year: number, month: number): number {
  return (new Date(Date.UTC(year, month, 1, 12)).getUTCDay() + 6) % 7;
}

function minutesBetween(start: string, end: string): number {
  const toMinutes = (value: string) => {
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
  };
  return toMinutes(end) - toMinutes(start);
}

function slotLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Bookable slots for a day, derived from the published opening hours. */
function slotsFor(day: Day): string[] {
  const schedule = CLINIC_PROFILE.schedule[weekdayOf(day)];
  if (!schedule) return [];
  const [open, close] = schedule;
  const total = minutesBetween(open, close);
  const slots: string[] = [];
  for (let offset = 0; offset + SLOT_MINUTES <= total; offset += SLOT_MINUTES) {
    const [h, m] = open.split(":").map(Number);
    slots.push(slotLabel(h * 60 + m + offset));
  }
  return slots;
}

function isBookable(day: Day, today: Day): boolean {
  const serial = (value: Day) => Math.round(Date.UTC(value.y, value.m, value.d) / 86_400_000);
  const distance = serial(day) - serial(today);
  return distance >= 0 && distance <= DAYS_AHEAD && slotsFor(day).length > 0;
}

function firstBookableDay(today: Day): Day {
  const cursor = new Date(Date.UTC(today.y, today.m, today.d, 12));
  for (let offset = 0; offset <= DAYS_AHEAD; offset += 1) {
    const day: Day = {
      y: cursor.getUTCFullYear(),
      m: cursor.getUTCMonth(),
      d: cursor.getUTCDate(),
    };
    if (isBookable(day, today)) return day;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return today;
}

function sameDay(a: Day | null, b: Day): boolean {
  return Boolean(a && a.y === b.y && a.m === b.m && a.d === b.d);
}

export function BookOnline() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [today, setToday] = useState<Day | null>(null);
  const [view, setView] = useState<"picker" | "details">("picker");
  const [month, setMonth] = useState<{ y: number; m: number } | null>(null);
  const [selected, setSelected] = useState<Day | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [clock, setClock] = useState("");
  const [state, formAction, pending] = useActionState(
    bookAppointmentAction,
    initialBookingState,
  );

  const slots = useMemo(() => (selected ? slotsFor(selected) : []), [selected]);

  const open = useCallback(() => {
    setView("picker");
    dialogRef.current?.showModal();
    document.documentElement.classList.add("overflow-hidden");
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
    document.documentElement.classList.remove("overflow-hidden");
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-book-online]")) return;
      event.preventDefault();
      open();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  useEffect(() => {
    const now = todayInClinic();
    const first = firstBookableDay(now);
    setToday(now);
    setSelected(first);
    setMonth({ y: first.y, m: first.m });
  }, []);

  useEffect(() => {
    const tick = () =>
      setClock(
        new Intl.DateTimeFormat("en-US", {
          timeZone: TZ,
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, []);

  const done = state.status === "success" && state.confirmation;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="bookingTitle"
      onClose={() => document.documentElement.classList.remove("overflow-hidden")}
      className="z-[90] h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 text-forest backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <div className="animate-modal-in grid max-h-[92svh] w-full max-w-[64rem] overflow-y-auto border border-cream/15 bg-cream shadow-[0_40px_120px_-40px_rgba(0,0,0,0.55)] lg:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="relative flex flex-col gap-4 bg-forest px-6 py-6 text-cream sm:px-7">
            <div className="flex items-center justify-between gap-4">
              <span className="font-display text-[1.2rem] font-extrabold tracking-[-0.055em]">
                {CLINIC_PROFILE.name}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close booking"
                className="grid size-8 place-items-center rounded-full border border-cream/30 text-cream transition-colors hover:bg-cream hover:text-forest"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <Image
                src="/images/dental-team.jpg"
                alt=""
                width={42}
                height={42}
                className="size-10 rounded-full object-cover"
              />
              <span>
                <b className="block text-[13px] font-medium text-cream">The front desk</b>
                <em className="mt-0.5 block text-[8.5px] uppercase not-italic tracking-[0.08em] text-cream/55">
                  {CLINIC_PROFILE.address[0]}
                </em>
              </span>
            </div>

            <div>
              <h2
                id="bookingTitle"
                className="font-display text-[clamp(1.9rem,3vw,2.4rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-cream"
              >
                Book an appointment
              </h2>
              <p className="mt-3 max-w-[34ch] text-[12.5px] leading-[1.55] text-cream/65">
                Choose a time, then tell us who to expect. We confirm every request by
                phone or email the same working day — no payment needed to hold a slot.
              </p>
            </div>

            <ul className="border-t border-cream/15">
              <li className="flex items-baseline justify-between gap-4 border-b border-cream/10 py-2 text-[9px] uppercase tracking-[0.08em] text-cream/50">
                Visit <b className="text-[11.5px] font-medium normal-case tracking-normal text-cream">{SLOT_MINUTES} min · In clinic</b>
              </li>
              <li className="flex items-baseline justify-between gap-4 border-b border-cream/10 py-2 text-[9px] uppercase tracking-[0.08em] text-cream/50">
                Where <b className="text-[11.5px] font-medium normal-case tracking-normal text-cream">SoHo, New York</b>
              </li>
              <li className="flex items-baseline justify-between gap-4 border-b border-cream/10 py-2 text-[9px] uppercase tracking-[0.08em] text-cream/50">
                Right now <b className="text-[11.5px] font-medium tabular-nums text-cream">{clock || "--:--"} NY</b>
              </li>
            </ul>

            <p className="mt-auto pt-2 text-[10px] leading-relaxed text-cream/50">
              Prefer to talk? Call{" "}
              <a href={CLINIC_PROFILE.phoneHref} className="text-cream underline underline-offset-2">
                {CLINIC_PROFILE.phone}
              </a>
              .
            </p>
          </aside>

          <div className="px-5 py-6 sm:px-8 sm:py-7">
            {done ? (
              <div className="animate-step-in flex flex-col items-start">
                <span className="grid size-11 place-items-center rounded-full bg-forest text-cream">
                  <CheckIcon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-[1.8rem] font-extrabold leading-[1.02] tracking-[-0.05em] text-forest">
                  Request received.
                </h3>
                <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
                  Thank you, {done.patientName}. We have pencilled you in for:
                </p>
                <dl className="mt-5 w-full border-y border-forest/15 py-4 text-[13px]">
                  <div className="flex justify-between gap-6">
                    <dt className="text-muted">When</dt>
                    <dd className="text-right text-forest">
                      {done.date} · {done.time}
                    </dd>
                  </div>
                  <div className="mt-2 flex justify-between gap-6">
                    <dt className="text-muted">Visit</dt>
                    <dd className="text-right text-forest">{done.treatment}</dd>
                  </div>
                </dl>
                <p className="mt-4 max-w-[42ch] text-[11.5px] leading-relaxed text-muted">
                  The front desk will call to confirm the time and talk through anything
                  we should know before your visit.
                </p>
                <button type="button" onClick={close} className="btn btn-primary mt-6">
                  <RollingLabel>Done</RollingLabel>
                  <RollingChip />
                </button>
              </div>
            ) : view === "details" ? (
              <form action={formAction} className="animate-step-in">
                <button
                  type="button"
                  onClick={() => setView("picker")}
                  className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-muted transition-colors hover:text-forest"
                >
                  ← Change time
                </button>
                <h3 className="mt-3 font-display text-[1.7rem] font-extrabold leading-none tracking-[-0.05em] text-forest">
                  Your details
                </h3>
                <p className="mt-3 flex flex-col gap-1 border border-forest/15 bg-cream-50 px-3.5 py-3">
                  <b className="text-[12.5px] font-semibold text-forest">
                    {selected ? weekdayLabel(selected) : ""} · {slot}
                  </b>
                  <span className="text-[8.5px] font-semibold uppercase tracking-[0.1em] text-muted">
                    {SLOT_MINUTES} min · In clinic · {TZ}
                  </span>
                </p>

                <input type="hidden" name="preferredDate" value={selected ? iso(selected) : ""} />
                <input type="hidden" name="preferredTime" value={slot ?? ""} />

                {state.status === "error" ? (
                  <p
                    role="alert"
                    className="mb-3 border border-[#8A4A4A]/30 bg-[#8A4A4A]/5 px-3 py-2 text-[11px] text-[#8A4A4A]"
                  >
                    {state.message}
                  </p>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <BookingField label="First name" name="firstName" error={state.errors?.firstName}>
                    <input id="firstName" name="firstName" required autoComplete="given-name" placeholder="Amelia" className={fieldClass} />
                  </BookingField>
                  <BookingField label="Last name" name="lastName" error={state.errors?.lastName}>
                    <input id="lastName" name="lastName" required autoComplete="family-name" placeholder="Fontaine" className={fieldClass} />
                  </BookingField>
                  <BookingField label="Email" name="email" error={state.errors?.email}>
                    <input id="email" name="email" type="email" required autoComplete="email" placeholder="amelia@example.com" className={fieldClass} />
                  </BookingField>
                  <BookingField label="Phone" name="phone" error={state.errors?.phone}>
                    <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+1 (212) 555-0117" className={fieldClass} />
                  </BookingField>
                </div>

                <BookingField label="What brings you in?" name="notes" className="mt-3">
                  <textarea id="notes" name="notes" rows={2} placeholder="A sentence is plenty." className={`${fieldClass} resize-y`} />
                </BookingField>

                <button type="submit" disabled={pending} className="btn btn-primary btn-block mt-5 disabled:opacity-60">
                  <RollingLabel>{pending ? "Sending…" : "Request appointment"}</RollingLabel>
                  <RollingChip />
                </button>
              </form>
            ) : today && month ? (
              <CalendarPanel
                today={today}
                month={month}
                setMonth={setMonth}
                selected={selected}
                slots={slots}
                onSelectDay={(day) => {
                  setSelected(day);
                  setSlot(null);
                }}
                onPickSlot={(time) => {
                  setSlot(time);
                  setView("details");
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </dialog>
  );
}

const fieldClass =
  "w-full border border-forest/18 bg-cream-50/70 px-2.5 py-2 text-[12.5px] text-forest outline-none transition-colors placeholder:text-muted/45 focus:border-forest/45 focus:bg-cream-50";

function BookingField({
  label,
  name,
  error,
  className,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-[8.5px] font-extrabold uppercase tracking-[0.12em] text-muted"
      >
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error ? <p className="mt-1 text-[10.5px] text-[#8A4A4A]">{error}</p> : null}
    </div>
  );
}

function weekdayLabel(day: Day): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(day.y, day.m, day.d, 12)));
}

function CalendarPanel({
  today,
  month,
  setMonth,
  selected,
  slots,
  onSelectDay,
  onPickSlot,
}: {
  today: Day;
  month: { y: number; m: number };
  setMonth: (next: { y: number; m: number }) => void;
  selected: Day | null;
  slots: string[];
  onSelectDay: (day: Day) => void;
  onPickSlot: (time: string) => void;
}) {
  const monthAhead = (month.y - today.y) * 12 + (month.m - today.m);
  const offset = monthOffset(month.y, month.m);
  const total = daysInMonth(month.y, month.m);
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: total }, (_, index) => index + 1),
  ];

  return (
              <div className="animate-step-in">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-muted">
                      Select a date
                    </p>
                    <h3 className="mt-1 font-display text-[1.4rem] font-extrabold tracking-[-0.045em] text-forest">
                      {MONTHS[month.m]} {month.y}
                    </h3>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      aria-label="Previous month"
                      disabled={monthAhead <= 0}
                      onClick={() => {
                        const date = new Date(Date.UTC(month.y, month.m - 1, 1));
                        setMonth({ y: date.getUTCFullYear(), m: date.getUTCMonth() });
                      }}
                      className="grid size-8 place-items-center rounded-full border border-forest/20 text-[12px] text-forest transition-colors hover:bg-forest hover:text-cream disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-forest"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      aria-label="Next month"
                      disabled={monthAhead >= 3}
                      onClick={() => {
                        const date = new Date(Date.UTC(month.y, month.m + 1, 1));
                        setMonth({ y: date.getUTCFullYear(), m: date.getUTCMonth() });
                      }}
                      className="grid size-8 place-items-center rounded-full border border-forest/20 text-[12px] text-forest transition-colors hover:bg-forest hover:text-cream disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-forest"
                    >
                      →
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[8px] font-extrabold uppercase tracking-[0.12em] text-muted">
                  {WEEKDAY_INITIALS.map((label, index) => (
                    <span key={`${label}-${index}`}>{label}</span>
                  ))}
                </div>

                <div className="mt-1.5 grid grid-cols-7 gap-1">
                  {cells.map((day, index) => {
                    if (!day) return <span key={`blank-${index}`} aria-hidden="true" />;
                    const date: Day = { y: month.y, m: month.m, d: day };
                    const enabled = isBookable(date, today);
                    const active = sameDay(selected, date);
                    const isToday = sameDay(today, date);
                    return (
                      <button
                        key={iso(date)}
                        type="button"
                        disabled={!enabled}
                        aria-pressed={active}
                        aria-label={`${MONTHS[month.m]} ${day}${enabled ? "" : " — unavailable"}`}
                        onClick={() => {
                          onSelectDay(date);
                        }}
                        className={cn(
                          "relative mx-auto grid size-9 place-items-center rounded-full text-[11.5px] tabular-nums transition-all duration-200",
                          active
                            ? "bg-forest text-cream"
                            : enabled
                              ? "text-forest/80 hover:bg-forest/8"
                              : "cursor-not-allowed text-muted/30",
                          isToday && !active && "ring-1 ring-clay/40",
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-forest/15 pt-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-muted">
                    Available times
                    {selected ? ` · ${MONTHS[selected.m].slice(0, 3)} ${selected.d}` : ""}
                  </p>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted/60">
                    {SLOT_MINUTES} min
                  </span>
                </div>

                <div className="mt-2.5 grid max-h-[10.5rem] grid-cols-4 gap-1.5 overflow-y-auto pr-1">
                  {slots.length === 0 ? (
                    <p className="col-span-full py-1 text-[11.5px] leading-relaxed text-muted">
                      No times left on this day. Try the next one.
                    </p>
                  ) : (
                    slots.map((time, index) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          onPickSlot(time);
                        }}
                        style={{ animationDelay: `${index * 35}ms` }}
                        className="animate-slot-in border border-forest/18 py-2 text-center text-[10px] font-semibold tabular-nums text-forest/75 transition-colors hover:border-forest hover:bg-forest hover:text-cream"
                      >
                        {time}
                      </button>
                    ))
                  )}
                </div>
              </div>
  );
}
