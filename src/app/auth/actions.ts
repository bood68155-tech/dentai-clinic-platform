"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import { patients, users } from "@/db/schema";
import { findUserByEmail, getClinic } from "@/db/queries";
import { roleHome } from "@/lib/auth";
import { dummyPasswordCheck, hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroyCurrentSession } from "@/lib/session";

export type AuthState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string>;
};

export const initialAuthState: AuthState = { status: "idle" };

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const MIN_PASSWORD_LENGTH = 10;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Generic on purpose: never reveals whether an account exists. */
const GENERIC_LOGIN_ERROR = "Invalid email or password.";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export async function signInAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");

  if (!email || !password) {
    return { status: "error", message: GENERIC_LOGIN_ERROR };
  }

  let user;
  try {
    user = await findUserByEmail(email);
  } catch (error) {
    console.error("signInAction lookup failed", error);
    return {
      status: "error",
      message: "Sign-in is unavailable right now. Please try again in a moment.",
    };
  }

  // Account does not exist, has no password, or is disabled. Burn the same
  // scrypt work as a real check and say nothing specific.
  if (!user || !user.passwordHash || !user.isActive) {
    await dummyPasswordCheck(password);
    return { status: "error", message: GENERIC_LOGIN_ERROR };
  }

  const now = new Date();
  const locked = user.lockedUntil !== null && user.lockedUntil > now;
  if (locked) {
    return {
      status: "error",
      message:
        "Too many failed sign-in attempts. Wait a few minutes and try again.",
    };
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);

  const db = getDb();
  if (!passwordOk) {
    const attempts = user.failedLoginAttempts + 1;
    const lockedUntil =
      attempts >= MAX_FAILED_ATTEMPTS
        ? new Date(now.getTime() + LOCKOUT_MINUTES * 60_000)
        : null;

    await db
      .update(users)
      .set({
        failedLoginAttempts: attempts,
        lockedUntil,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    return { status: "error", message: GENERIC_LOGIN_ERROR };
  }

  // Success: clear the failure counters, then open a session.
  await db
    .update(users)
    .set({ failedLoginAttempts: 0, lockedUntil: null, updatedAt: now })
    .where(eq(users.id, user.id));

  await createSession(user.id);

  redirect(roleHome(user.role));
}

/**
 * Patient self-registration. If the practice already holds a patient record
 * with the same email (for example from an online booking), exactly one
 * unique match is linked so the dashboard shows that record immediately.
 */
export async function registerPatientAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const firstName = text(formData, "firstName");
  const lastName = text(formData, "lastName");
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");

  const errors: Record<string, string> = {};
  if (!firstName) errors.firstName = "First name is required.";
  if (!lastName) errors.lastName = "Last name is required.";
  if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors,
    };
  }

  const db = getDb();

  try {
    if (await findUserByEmail(email)) {
      return {
        status: "error",
        message:
          "An account with this email already exists. Sign in instead, or use a different address.",
      };
    }

    const clinic = await getClinic();
    if (!clinic) {
      return {
        status: "error",
        message: "Registration is not available yet. Please book a visit instead.",
      };
    }

    const passwordHash = await hashPassword(password);

    // Link a unique existing patient record with the same email address.
    const matches = await db
      .select({ id: patients.id })
      .from(patients)
      .where(sql`lower(${patients.email}) = ${email}`)
      .limit(2);
    const linkedPatientId = matches.length === 1 ? matches[0].id : null;

    const [created] = await db
      .insert(users)
      .values({
        clinicId: clinic.id,
        fullName: `${firstName} ${lastName}`,
        email,
        role: "patient",
        patientId: linkedPatientId,
        passwordHash,
        emailVerifiedAt: new Date(),
      })
      .returning({ id: users.id });

    await createSession(created.id);
  } catch (error) {
    console.error("registerPatientAction failed", error);
    return {
      status: "error",
      message: "Could not create your account. Please try again.",
    };
  }

  redirect("/account");
}

export async function signOutAction(): Promise<never> {
  await destroyCurrentSession();
  redirect("/");
}
