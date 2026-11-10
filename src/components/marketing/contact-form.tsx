"use client";

import { useActionState } from "react";

import { sendContactMessageAction } from "@/app/contact/actions";
import { Roll } from "@/components/marketing/roll";
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
 * The reference contact form in full: paired name and contact rows, a
 * full-width "how did you hear about us" select, subject, and a ruled message
 * box. Labels sit at the left edge of each row and the value fills the rest,
 * with a single hairline under every row.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessageAction,
    initialContactState,
  );

  if (state.status === "success") {
    return (
      <div className="flex min-h-[20rem] items-start border-t border-[color:var(--ref-border)] pt-6">
        <p className="paragraph-lg text-[color:var(--ref-gold)]">{state.message}</p>
      </div>
    );
  }

  const error = (name: string) =>
    state.errors?.[name] ? <span className="input-error">{state.errors[name]}</span> : null;

  return (
    <form action={formAction} noValidate className="form-contact">
      <div className="input-group cell-divide">
        <label htmlFor="firstName" className="input-label">
          First Name*
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          required
          maxLength={256}
          autoComplete="given-name"
          className="input-form"
          aria-invalid={state.errors?.firstName ? true : undefined}
        />
        {error("firstName")}
      </div>

      <div className="input-group">
        <label htmlFor="lastName" className="input-label">
          Last Name*
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          required
          maxLength={256}
          autoComplete="family-name"
          className="input-form"
          aria-invalid={state.errors?.lastName ? true : undefined}
        />
        {error("lastName")}
      </div>

      <div className="input-group cell-divide">
        <label htmlFor="email" className="input-label">
          Email*
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={256}
          autoComplete="email"
          className="input-form"
          aria-invalid={state.errors?.email ? true : undefined}
        />
        {error("email")}
      </div>

      <div className="input-group">
        <label htmlFor="phone" className="input-label">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          maxLength={256}
          autoComplete="tel"
          className="input-form"
          aria-invalid={state.errors?.phone ? true : undefined}
        />
        {error("phone")}
      </div>

      <div className="input-group col-span-full">
        <label htmlFor="hear" className="input-label">
          How did you hear about us?
        </label>
        <select id="hear" name="hear" defaultValue="" className="input">
          <option value="">Select one...</option>
          {HEARD.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="input-group col-span-full">
        <label htmlFor="subject" className="input-label">
          Subject*
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          maxLength={256}
          className="input-form"
          aria-invalid={state.errors?.subject ? true : undefined}
        />
        {error("subject")}
      </div>

      <div className="input-group textarea col-span-full">
        <label htmlFor="message" className="input-label">
          Message*
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={5000}
          placeholder="Start typing your message..."
          className="input-form-message"
          aria-invalid={state.errors?.message ? true : undefined}
        />
        {error("message")}
      </div>

      {state.errors && Object.keys(state.errors).length > 0 ? (
        <p role="alert" className="form-error-box col-span-full">
          {state.message}
        </p>
      ) : null}

      <div className="col-span-full mt-8">
        <button type="submit" disabled={pending} className="button">
          <Roll>{pending ? "Sending..." : "Submit"}</Roll>
        </button>
      </div>
    </form>
  );
}
