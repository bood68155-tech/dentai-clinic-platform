"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInAction } from "@/app/auth/actions";
import { initialAuthState } from "@/lib/form-state";

const inputClass =
  "w-full rounded-xl border border-line bg-cream-50 px-3.5 py-2.5 text-[13px] text-forest placeholder:text-muted/50 transition-colors focus:border-forest/40 focus:outline-none";

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
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
      {error ? <p className="mt-1.5 text-[11px] text-[#8A4A4A]">{error}</p> : null}
    </div>
  );
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialAuthState);

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-xl border border-[#8A4A4A]/30 bg-[#8A4A4A]/5 px-4 py-3 text-[12px] text-[#8A4A4A]"
        >
          {state.message}
        </p>
      ) : null}

      <Field label="Email" name="email" error={state.errors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Password" name="password" error={state.errors?.password}>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
          placeholder="••••••••"
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-forest px-5 py-3 text-[13px] font-medium text-cream transition-colors hover:bg-forest-700 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-[12px] text-muted">
        New patient?{" "}
        <Link href="/register" className="font-medium text-forest underline underline-offset-4 hover:text-clay">
          Create an account
        </Link>
      </p>
    </form>
  );
}
