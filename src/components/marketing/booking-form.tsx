"use client";

import Link from "next/link";
import { useActionState } from "react";

import { bookAppointmentAction } from "@/app/book/actions";
import { initialBookingState } from "@/lib/form-state";
import { CheckIcon } from "@/components/icons";
import { RollingChip, RollingLabel } from "@/components/rolling-label";
import { BOOKABLE_TIMES } from "@/lib/time";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-forest/15 bg-cream-50 px-3.5 py-3 text-[13px] text-forest placeholder:text-muted/45 transition-colors focus:border-forest/40 focus:outline-none";

function Field({
  label,
  name,
  error,
  children,
  hint,
  className,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted"
      >
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1.5 text-[11px] text-[#8A4A4A]">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[10.5px] text-muted/70">{hint}</p>
      ) : null}
    </div>
  );
}

export function BookingForm({
  treatments,
  minDate,
  defaultDate,
  defaultTime,
  defaultTreatmentId,
}: {
  treatments: { id: string; code: string; name: string; durationMinutes: number }[];
  minDate: string;
  defaultDate: string;
  defaultTime: string;
  defaultTreatmentId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    bookAppointmentAction,
    initialBookingState,
  );

  if (state.status === "success" && state.confirmation) {
    return (
      <div className="surface p-7 lg:p-9">
        <span className="grid size-11 place-items-center rounded-full bg-forest text-cream">
          <CheckIcon className="size-5" />
        </span>
        <h2 className="mt-5 font-display text-[1.9rem] leading-tight text-forest">
          Request received.
        </h2>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          Thank you, {state.confirmation.patientName}. We have pencilled you in for:
        </p>
        <dl className="mt-5 space-y-2 border-y border-line py-4 text-[13px]">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">When</dt>
            <dd className="text-forest">
              {state.confirmation.date} · {state.confirmation.time}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Treatment</dt>
            <dd className="text-forest">{state.confirmation.treatment}</dd>
          </div>
        </dl>
        <p className="mt-4 text-[12px] leading-relaxed text-muted">
          The front desk will call to confirm the time and talk through anything we
          should know before your visit.
        </p>
        <Link href="/" className="btn btn-outline btn-sm mt-6">
          <RollingLabel>Back to the clinic</RollingLabel>
          <RollingChip />
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="surface p-7 lg:p-9">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-[1.7rem] font-extrabold tracking-[-0.05em] text-forest">
          Request an appointment
        </h2>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Online
        </span>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted">
        Send a preferred time and we will confirm it by phone or email. New patients
        welcome.
      </p>

      {state.status === "error" ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-[#8A4A4A]/30 bg-[#8A4A4A]/5 px-4 py-3 text-[12px] text-[#8A4A4A]"
        >
          {state.message}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="firstName" error={state.errors?.firstName}>
          <input
            id="firstName"
            name="firstName"
            required
            autoComplete="given-name"
            className={inputClass}
            placeholder="Amelia"
          />
        </Field>
        <Field label="Last name" name="lastName" error={state.errors?.lastName}>
          <input
            id="lastName"
            name="lastName"
            required
            autoComplete="family-name"
            className={inputClass}
            placeholder="Fontaine"
          />
        </Field>
        <Field label="Email" name="email" error={state.errors?.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder="amelia@example.com"
          />
        </Field>
        <Field
          label="Phone"
          name="phone"
          error={state.errors?.phone}
          hint="Email or phone, whichever you prefer."
        >
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={inputClass}
            placeholder="+1 (212) 555-0117"
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Treatment" name="treatmentTypeId" className="sm:col-span-2">
          <select
            id="treatmentTypeId"
            name="treatmentTypeId"
            defaultValue={defaultTreatmentId ?? ""}
            className={inputClass}
          >
            <option value="">Not sure — general check-up</option>
            {treatments.map((treatment) => (
              <option key={treatment.id} value={treatment.id}>
                {treatment.name} ({treatment.durationMinutes} min)
              </option>
            ))}
          </select>
        </Field>
        <Field label="Preferred date" name="preferredDate" error={state.errors?.preferredDate}>
          <input
            id="preferredDate"
            name="preferredDate"
            type="date"
            required
            min={minDate}
            defaultValue={defaultDate}
            className={inputClass}
          />
        </Field>
        <Field label="Preferred time" name="preferredTime" error={state.errors?.preferredTime}>
          <select
            id="preferredTime"
            name="preferredTime"
            defaultValue={defaultTime}
            className={inputClass}
          >
            {BOOKABLE_TIMES.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Anything we should know" name="notes" className="sm:col-span-2">
          <textarea
            id="notes"
            name="notes"
            rows={2}
            className={inputClass}
            placeholder="Nervous patient, insurance, accessibility needs…"
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className={cn("btn btn-primary", pending && "opacity-60")}
        >
          <RollingLabel>{pending ? "Sending…" : "Request appointment"}</RollingLabel>
          <RollingChip />
        </button>
        <span className="text-[10.5px] leading-snug text-muted">
          No payment is taken online.
        </span>
      </div>
    </form>
  );
}
