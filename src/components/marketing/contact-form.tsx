"use client";

import { useActionState } from "react";

import { sendContactMessageAction } from "@/app/contact/actions";
import { initialContactState } from "@/lib/form-state";

const HEARD = [
  "Search engine",
  "Social media",
  "Word of mouth",
  "Advertisement",
  "Walk in",
  "Other",
];

/**
 * Contact form matching the reference layout: label and value share one
 * ruled row, the first cell of every pair carries the divider, and the
 * select sits behind its own hairline with a chevron at the far edge.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessageAction,
    initialContactState,
  );

  if (state.status === "success") {
    return (
      <div className="flex min-h-[25rem] items-start">
        <p className="lede text-clay">{state.message}</p>
      </div>
    );
  }

  const error = (name: string) =>
    state.errors?.[name] ? (
      <span className="field-error">{state.errors[name]}</span>
    ) : null;

  return (
    <form action={formAction} noValidate className="grid grid-cols-1 sm:grid-cols-2">
      {state.status === "error" && state.errors === undefined ? (
        <p role="alert" className="form-error sm:col-span-2">
          {state.message}
        </p>
      ) : null}

      <div className="field sm:border-r sm:border-ink sm:pr-6">
        <label htmlFor="firstName" className="field-label">
          First Name*
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          required
          maxLength={256}
          autoComplete="given-name"
          className="field-input"
          aria-invalid={state.errors?.firstName ? true : undefined}
        />
      </div>

      <div className="field sm:pl-6">
        <label htmlFor="lastName" className="field-label">
          Last Name*
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          required
          maxLength={256}
          autoComplete="family-name"
          className="field-input"
          aria-invalid={state.errors?.lastName ? true : undefined}
        />
      </div>

      <div className="field sm:border-r sm:border-ink sm:pr-6">
        <label htmlFor="email" className="field-label">
          Email*
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={256}
          autoComplete="email"
          className="field-input"
          aria-invalid={state.errors?.email ? true : undefined}
        />
      </div>

      <div className="field sm:pl-6">
        <label htmlFor="phone" className="field-label">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          maxLength={256}
          autoComplete="tel"
          className="field-input"
        />
      </div>

      <div className="field relative sm:col-span-2">
        <label htmlFor="hear" className="field-label">
          How did you hear about us?
        </label>
        <select id="hear" name="hear" defaultValue="" className="field-input pr-10">
          <option value="">Select one...</option>
          {HEARD.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute right-0 top-1/2 size-6 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M5 9l7 7 7-7" strokeLinecap="square" />
        </svg>
      </div>

      <div className="field sm:col-span-2">
        <label htmlFor="subject" className="field-label">
          Subject*
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          maxLength={256}
          className="field-input"
          aria-invalid={state.errors?.subject ? true : undefined}
        />
      </div>

      <div className="field field-area sm:col-span-2">
        <label htmlFor="message" className="field-label">
          Message*
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={5000}
          placeholder="Start typing your message..."
          aria-invalid={state.errors?.message ? true : undefined}
        />
        {error("message")}
      </div>

      {(state.errors?.firstName ||
        state.errors?.lastName ||
        state.errors?.email ||
        state.errors?.phone ||
        state.errors?.subject) && (
        <p role="alert" className="field-error sm:col-span-2 pt-2">
          {state.message}
        </p>
      )}

      <div className="mt-10 sm:col-span-2">
        <button type="submit" disabled={pending} className="btn">
          {pending ? "Please wait..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
