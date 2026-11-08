import type { AgendaItem } from "@/db/queries";
import { formatTime } from "@/lib/utils";

import { EmptyState, StatusBadge } from "./ui";

const KIND_LABEL: Record<string, string> = {
  treatment: "Treatment",
  consultation: "Consultation",
  hygiene: "Hygiene",
  break: "Break",
  lunch: "Lunch",
  block: "Blocked",
};

export function AgendaList({
  items,
  timeZone,
  emptyTitle = "Nothing booked",
  emptyBody = "There are no appointments in this day's book.",
  emptyAction,
}: {
  items: AgendaItem[];
  timeZone: string;
  emptyTitle?: string;
  emptyBody?: string;
  emptyAction?: { label: string; href: string };
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} body={emptyBody} action={emptyAction} />;
  }

  return (
    <ul className="divide-y divide-line/70">
      {items.map((item) => {
        const patientName = item.patientFirstName
          ? `${item.patientFirstName} ${item.patientLastName}`
          : null;
        const heading = patientName ?? item.title ?? KIND_LABEL[item.kind] ?? "Block";
        const detail = item.treatmentName ?? item.reason ?? KIND_LABEL[item.kind];

        return (
          <li key={item.id} className="flex gap-4 py-3 first:pt-1 last:pb-1">
            <div className="w-14 shrink-0 pt-0.5 text-right">
              <p className="text-[11.5px] font-medium text-forest tabular-nums">
                {formatTime(item.startsAt, timeZone)}
              </p>
              <p className="text-[10px] text-muted/70 tabular-nums">
                {formatTime(item.endsAt, timeZone)}
              </p>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-[13px] font-medium text-forest">{heading}</p>
                <StatusBadge status={item.status} />
              </div>
              {detail ? (
                <p className="mt-0.5 line-clamp-1 text-[11.5px] text-muted">{detail}</p>
              ) : null}
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[10.5px] text-muted/70">
                {item.operatoryName ? <span>{item.operatoryName}</span> : null}
                {item.practitionerName ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{item.practitionerName}</span>
                  </>
                ) : null}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
