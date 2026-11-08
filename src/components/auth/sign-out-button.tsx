"use client";

import { useTransition } from "react";

import { signOutAction } from "@/app/auth/actions";

export function SignOutButton({
  className,
  label = "Sign out",
}: {
  className?: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => void signOutAction())}
      className={
        className ??
        "text-[11px] font-medium text-muted transition-colors hover:text-[#8A4A4A] disabled:opacity-60"
      }
    >
      {pending ? "Signing out…" : label}
    </button>
  );
}
