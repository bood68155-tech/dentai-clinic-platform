import { and, eq, or } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "./schema";
import { DEFAULT_CONSULT_MINUTES, zonedDateTime } from "../lib/time";

export type AppointmentRequestInput = {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  treatmentTypeId?: string | null;
  preferredDate: string;
  preferredTime: string;
  notes?: string | null;
  timeZone: string;
};

export type AppointmentRequestResult = {
  patientId: string;
  appointmentId: string;
  startsAt: Date;
  endsAt: Date;
  treatmentName: string | null;
  isNewPatient: boolean;
};

/**
 * Creates a booking request from the public site.
 *
 * A request is stored as a `consultation` appointment so it lands in the clinic
 * agenda immediately; the practice confirms it by phone. The patient record is
 * reused when the email or phone number already exists in this clinic — the
 * same de-duplication rule the front desk uses.
 */
export async function requestAppointment(
  db: PostgresJsDatabase<typeof schema>,
  clinicId: string,
  input: AppointmentRequestInput,
): Promise<AppointmentRequestResult> {
  if (!input.firstName.trim() || !input.lastName.trim()) {
    throw new Error("A first and last name are required.");
  }
  if (!input.email && !input.phone) {
    throw new Error("Provide an email address or a phone number.");
  }

  const startsAt = zonedDateTime(input.preferredDate, input.preferredTime, input.timeZone);
  if (Number.isNaN(startsAt.getTime())) {
    throw new Error("Choose a valid date and time.");
  }
  if (startsAt.getTime() < Date.now()) {
    throw new Error("Choose a time in the future.");
  }

  const match = await db
    .select({ id: schema.patients.id })
    .from(schema.patients)
    .where(
      and(
        eq(schema.patients.clinicId, clinicId),
        or(
          input.email ? eq(schema.patients.email, input.email) : undefined,
          input.phone ? eq(schema.patients.phone, input.phone) : undefined,
        ),
      ),
    )
    .limit(1);

  let patientId = match[0]?.id;
  const isNewPatient = !patientId;

  if (!patientId) {
    const [created] = await db
      .insert(schema.patients)
      .values({
        clinicId,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        referralSource: "Online booking",
        notes: input.notes?.trim() || null,
      })
      .returning({ id: schema.patients.id });
    patientId = created.id;
  }

  let duration = DEFAULT_CONSULT_MINUTES;
  let treatmentName: string | null = null;

  if (input.treatmentTypeId) {
    const [treatment] = await db
      .select({
        duration: schema.treatmentTypes.durationMinutes,
        name: schema.treatmentTypes.name,
      })
      .from(schema.treatmentTypes)
      .where(
        and(
          eq(schema.treatmentTypes.id, input.treatmentTypeId),
          eq(schema.treatmentTypes.clinicId, clinicId),
        ),
      )
      .limit(1);

    if (treatment) {
      duration = treatment.duration;
      treatmentName = treatment.name;
    }
  }

  const endsAt = new Date(startsAt.getTime() + duration * 60_000);

  const [appointment] = await db
    .insert(schema.appointments)
    .values({
      clinicId,
      patientId,
      treatmentTypeId: input.treatmentTypeId ?? null,
      startsAt,
      endsAt,
      status: "scheduled",
      kind: "consultation",
      reason: treatmentName ?? "Online booking request",
      notes: input.notes?.trim() || null,
    })
    .returning({ id: schema.appointments.id });

  return {
    patientId,
    appointmentId: appointment.id,
    startsAt,
    endsAt,
    treatmentName,
    isNewPatient,
  };
}
