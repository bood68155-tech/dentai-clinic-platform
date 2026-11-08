/**
 * Timezone helpers.
 *
 * Appointments are stored as `timestamptz` (UTC instants) while the practice
 * thinks in wall-clock time ("14:30 on the 12th"). These helpers convert
 * between the two using the runtime's `Intl` timezone database, so no extra
 * dependency is needed.
 */

/** Wall-clock time in `timeZone` → the matching UTC instant. */
export function zonedDateTime(day: string, time: string, timeZone: string): Date {
  const naive = new Date(`${day}T${time}:00Z`);
  if (Number.isNaN(naive.getTime())) {
    throw new Error(`Invalid date/time: ${day} ${time}`);
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(naive);

  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );

  // asUtc - naive is the zone offset at that instant.
  return new Date(naive.getTime() - (asUtc - naive.getTime()));
}

/** Today's date as `YYYY-MM-DD` in the clinic's timezone. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function shiftDay(day: string, days: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** 0 = Sunday. */
export function weekdayIndex(day: string): number {
  return new Date(`${day}T12:00:00Z`).getUTCDay();
}

/** Practice opening hours per weekday (0 = Sunday). */
export const OPENING_HOURS: Record<number, string[]> = {
  1: ["09:00", "10:30", "13:00", "15:00"],
  2: ["09:00", "10:30", "13:00", "15:00"],
  3: ["09:00", "10:30", "13:00", "15:00"],
  4: ["09:00", "10:30", "13:00", "15:00"],
  5: ["09:00", "10:30", "13:00"],
  6: ["09:00", "10:30"],
  0: [],
};

/** Every bookable time across the week, used by the request form. */
export const BOOKABLE_TIMES = ["09:00", "09:30", "10:30", "11:30", "13:00", "14:00", "15:00", "16:00"];

export const DEFAULT_CONSULT_MINUTES = 45;
