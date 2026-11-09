import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-clay">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-[clamp(1.9rem,3vw,2.6rem)] font-extrabold leading-[0.98] tracking-[-0.06em] text-forest">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[1.35rem] border border-forest/10 bg-cream-50 shadow-[0_18px_48px_-42px_rgba(23,81,54,0.55)]",
        className,
      )}
    >
      {title || action ? (
        <div className="flex items-start justify-between gap-4 border-b border-line/80 px-5 py-4">
          <div>
            <h2 className="font-display text-[1.15rem] font-extrabold leading-tight tracking-[-0.045em] text-forest">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-[11px] leading-relaxed text-muted">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={cn("px-5 py-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-forest/10 bg-cream-50 px-5 py-4 shadow-[0_18px_48px_-42px_rgba(23,81,54,0.5)]">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold leading-none tracking-[-0.05em] text-forest tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-2 text-[11px] leading-snug text-muted/80">{hint}</p> : null}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: "border-forest/20 bg-forest/5 text-forest/70",
  confirmed: "border-forest/20 bg-forest/5 text-forest/70",
  arrived: "border-clay/30 bg-clay/10 text-clay",
  in_chair: "border-clay/40 bg-clay/15 text-[#8a5a2f]",
  completed: "border-forest-500/30 bg-[#2F6F5E]/10 text-[#245546]",
  no_show: "border-[#8A4A4A]/30 bg-[#8A4A4A]/10 text-[#8A4A4A]",
  cancelled: "border-line bg-cream-100 text-muted",
  planned: "border-line bg-cream-100 text-forest/70",
  accepted: "border-forest-500/30 bg-[#2F6F5E]/10 text-[#245546]",
  declined: "border-[#8A4A4A]/30 bg-[#8A4A4A]/10 text-[#8A4A4A]",
  existing: "border-line bg-cream-100 text-forest/70",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium capitalize",
        STATUS_STYLES[status] ?? "border-line bg-cream-100 text-muted",
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function AlertBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#8A4A4A]/25 bg-[#8A4A4A]/8 px-2.5 py-0.5 text-[10px] font-medium text-[#8A4A4A]">
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-line px-5 py-8 text-center">
      <p className="font-display text-base text-forest">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-[12px] leading-relaxed text-muted">{body}</p>
      {action ? (
        <Link
          href={action.href}
          className="btn btn-outline btn-sm mt-4"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function DbNotice({ error }: { error: string }) {
  return (
    <div className="rounded-2xl border border-clay/30 bg-clay/5 px-5 py-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-clay">
        Database not connected
      </p>
      <p className="mt-2 font-display text-lg text-forest">{error}</p>
      <ol className="mt-3 space-y-1.5 text-[12px] leading-relaxed text-muted">
        <li>
          1. Create a Postgres database (Neon) and copy the connection string.
        </li>
        <li>
          2. Add it as <code className="rounded bg-cream-100 px-1.5 py-0.5">DATABASE_URL</code> in{" "}
          <code className="rounded bg-cream-100 px-1.5 py-0.5">.env.local</code> and in your Vercel
          project settings.
        </li>
        <li>
          3. Run <code className="rounded bg-cream-100 px-1.5 py-0.5">npm run db:push</code> then{" "}
          <code className="rounded bg-cream-100 px-1.5 py-0.5">npm run db:seed</code>.
        </li>
      </ol>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-sand/50", className)} />;
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl border border-line/60 px-4 py-3.5"
        >
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-2.5 w-1/3" />
            <Skeleton className="h-2 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
