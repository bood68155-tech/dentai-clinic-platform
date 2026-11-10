"use client";

import { useActionState } from "react";

import { sendContactMessageAction } from "@/app/contact/actions";
import { CheckIcon } from "@/components/icons";
import { RollingChip, RollingLabel } from "@/components/rolling-label";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";
import { initialContactState } from "@/lib/form-state";

const TOPICS = [
  "New patient exam",
  "Cleaning or hygiene",
  "Whitening or cosmetic",
  "Invisalign®",
  "Crown, bridge or implant",
  "Something urgent",
  "Something else",
];

const inputClass =
  "w-full rounded-[3px] border border-forest/18 bg-cream-50/80 px-3.5 py-3 text-[13.5px] text-forest placeholder:text-muted/45 hover:border-forest/30 focus:border-forest/50 focus:bg-cream-50 focus:outline-none";

function Field({
  label,
  name,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-[9px] font-extrabold uppercase tracking-[0.18em] text-muted"
      >
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1.5 text-[11px] text-[#8A4A4A]">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted/70">{hint}</p>
      ) : null}
    </div>
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessageAction,
    initialContactState,
  );

  if (state.status === "success") {
    return (
      <div className="animate-fade-up border border-forest/12 bg-cream-50 p-7 sm:p-9">
        <span className="grid size-11 place-items-center rounded-full bg-forest text-cream">
          <CheckIcon className="size-5" />
        </span>
        <h2 className="mt-5 max-w-[20ch] font-display text-[1.75rem] font-extrabold leading-[1.05] tracking-[-0.05em] text-forest">
          Thank you! Your submission has been received!
        </h2>
        <p className="mt-3 max-w-md text-[13px] leading-[1.7] text-muted">
          We will reply within one working day. If it is urgent, call the clinic on{" "}
          <a
            href={CLINIC_PROFILE.phoneHref}
            className="border-b border-forest/30 text-forest transition-colors hover:border-clay hover:text-clay"
          >
            {CLINIC_PROFILE.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-[3px] border border-[#8A4A4A]/30 bg-[#8A4A4A]/5 px-4 py-3 text-[12px] text-[#8A4A4A]"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" error={state.errors?.name}>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
            className={inputClass}
            aria-invalid={state.errors?.name ? true : undefined}
          />
        </Field>
        <Field label="Email" name="email" error={state.errors?.email}>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
            aria-invalid={state.errors?.email ? true : undefined}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Phone"
          name="phone"
          error={state.errors?.phone}
          hint="Optional — we can call instead of emailing."
        >
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 (212) 555-0117"
            className={inputClass}
          />
        </Field>
        <Field label="What can we help with?" name="topic">
          <select id="topic" name="topic" className={inputClass} defaultValue={TOPICS[0]}>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Message" name="message" error={state.errors?.message}>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder="A sentence or two is plenty."
          className={`${inputClass} min-h-[7.5rem] resize-y`}
          aria-invalid={state.errors?.message ? true : undefined}
        />
      </Field>

      <p className="text-[10px] uppercase leading-relaxed tracking-[0.12em] text-muted/80">
        We reply within one working day. For pain or swelling, call{" "}
        <a href={CLINIC_PROFILE.phoneHref} className="text-forest underline underline-offset-2">
          {CLINIC_PROFILE.phone}
        </a>{" "}
        instead.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-lg btn-block disabled:opacity-60"
      >
        <RollingLabel>{pending ? "Sending…" : "Send message"}</RollingLabel>
        <RollingChip />
      </button>
    </form>
  );
}
