import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import type { UserRole } from "@/db/schema";
import { readCurrentUser, type SessionUser } from "./session";

/** Roles with access to the clinic management workspace (`/clinic`). */
export const STAFF_ROLES: UserRole[] = [
  "owner",
  "dentist",
  "hygienist",
  "assistant",
  "receptionist",
];

export function isStaff(role: UserRole): boolean {
  return STAFF_ROLES.includes(role);
}

export function isClinicOwner(role: UserRole): boolean {
  return role === "owner";
}

/** Where a signed-in user belongs, based on role. */
export function roleHome(role: UserRole): string {
  return isStaff(role) ? "/clinic" : "/account";
}

/** Read once per request; every guard in the same render shares the result. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  return readCurrentUser();
});

/** Any signed-in user. Redirects guests to `/login`. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Staff only (doctors, hygiene, front desk, owner). Guests go to `/login`;
 * patients are sent to their own dashboard instead of a dead end.
 */
export async function requireStaffUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isStaff(user.role)) redirect("/account");
  return user;
}

/** Clinic owners only — for admin-level actions. */
export async function requireOwnerUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "patient") redirect("/account");
  if (!isClinicOwner(user.role)) redirect("/clinic");
  return user;
}

/** Patients only. Staff are sent to the clinic workspace. */
export async function requirePatientUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (isStaff(user.role)) redirect("/clinic");
  return user;
}
