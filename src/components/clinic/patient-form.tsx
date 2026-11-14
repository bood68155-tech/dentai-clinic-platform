"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createPatientAction } from "@/app/actions";
import { initialActionState } from "@/lib/form-state";

const inputClass =
  "w-full rounded-xl border border-line bg-cream-50 px-3.5 py-2.5 text-[13px] text-forest placeholder:text-muted/50 transition-colors focus:border-forest/40 focus:outline-none";

function Field({
  label,
  name,
  error,
  hint,
  children,
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

export function PatientForm() {
  const [state, formAction, pending] = useActionState(
    createPatientAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-7">
      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-xl border border-[#8A4A4A]/30 bg-[#8A4A4A]/5 px-4 py-3 text-[12px] text-[#8A4A4A]"
        >
          {state.message}
        </p>
      ) : null}

      <fieldset className="rounded-2xl border border-line bg-cream-50/80 p-5">
        <legend className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-clay">
          Identity
        </legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
          <Field label="Date of birth" name="dateOfBirth" error={state.errors?.dateOfBirth}>
            <input id="dateOfBirth" name="dateOfBirth" type="date" className={inputClass} />
          </Field>
          <Field label="Gender" name="gender">
            <select id="gender" name="gender" className={inputClass} defaultValue="">
              <option value="">Not recorded</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-line bg-cream-50/80 p-5">
        <legend className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-clay">
          Contact
        </legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
          <Field label="Phone" name="phone">
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className={inputClass}
              placeholder="+1 (212) 555-0117"
            />
          </Field>
          <Field label="Address" name="address" className="sm:col-span-2">
            <input
              id="address"
              name="address"
              autoComplete="street-address"
              className={inputClass}
              placeholder="Al-Bahr Street, Khan Yunis, Gaza"
            />
          </Field>
          <Field label="Occupation" name="occupation">
            <input id="occupation" name="occupation" className={inputClass} />
          </Field>
          <Field label="Referral source" name="referralSource">
            <input id="referralSource" name="referralSource" className={inputClass} placeholder="Google" />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-line bg-cream-50/80 p-5">
        <legend className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-clay">
          Medical
        </legend>
        <div className="mt-3 space-y-4">
          <Field
            label="Medical alerts"
            name="medicalAlerts"
            hint="Comma separated, e.g. allergy: penicillin, anticoagulants"
          >
            <input id="medicalAlerts" name="medicalAlerts" className={inputClass} />
          </Field>
          <Field label="Medical notes" name="medicalNotes">
            <textarea
              id="medicalNotes"
              name="medicalNotes"
              rows={3}
              className={inputClass}
              placeholder="Relevant history, medication, coordination with other clinicians."
            />
          </Field>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary"
        >
          {pending ? "Saving…" : "Create patient"}
        </button>
        <Link
          href="/clinic/patients"
          className="text-[12px] font-medium text-muted transition-colors hover:text-forest"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
