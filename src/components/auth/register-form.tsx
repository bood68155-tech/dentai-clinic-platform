"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerPatientAction } from "@/app/auth/actions";
import { initialAuthState } from "@/lib/form-state";

const inputClass =
  "w-full rounded-xl border border-line bg-cream-50 px-3.5 py-2.5 text-[13px] text-forest placeholder:text-muted/50 transition-colors focus:border-forest/40 focus:outline-none";

function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
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

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerPatientAction,
    initialAuthState,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "error" && !state.errors ? (
        <p
          role="alert"
          className="rounded-xl border border-[#8A4A4A]/30 bg-[#8A4A4A]/5 px-4 py-3 text-[12px] text-[#8A4A4A]"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

      <Field label="Email" name="email" error={state.errors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
          placeholder="amelia@example.com"
        />
      </Field>

      <Field
        label="Password"
        name="password"
        error={state.errors?.password}
        hint="At least 10 characters."
      >
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={10}
          className={inputClass}
          placeholder="••••••••••"
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-forest px-5 py-3 text-[13px] font-medium text-cream transition-colors hover:bg-forest-700 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-[12px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-forest underline underline-offset-4 hover:text-clay">
          Sign in
        </Link>
      </p>
    </form>
  );
}
