export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
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

export function formatDate(
  value: Date | string | null | undefined,
  timeZone = "UTC",
  options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" },
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", { ...options, timeZone }).format(date);
}

export function formatTime(value: Date | string, timeZone = "UTC"): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatTimeRange(
  start: Date | string,
  end: Date | string,
  timeZone = "UTC",
): string {
  return `${formatTime(start, timeZone)} – ${formatTime(end, timeZone)}`;
}

export function formatMoney(value: string | number | null | undefined, currency = "USD"): string {
  const amount = typeof value === "string" ? Number(value) : (value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function ageFrom(dateOfBirth: string | Date | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = typeof dateOfBirth === "string" ? new Date(`${dateOfBirth}T00:00:00Z`) : dateOfBirth;
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dob.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < dob.getUTCDate())) age -= 1;
  return age;
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function isoDay(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function shiftDay(day: string, days: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
