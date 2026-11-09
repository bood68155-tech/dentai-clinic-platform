import { createHash, randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

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

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
};

export type UploadImageInput = {
  patientId: string;
  file: File;
  category: schema.ImagingCategory;
  tooth?: string | null;
  description?: string | null;
  chartId?: string | null;
  treatmentPlanItemId?: string | null;
};

/**
 * Stores a clinical image on local disk and records it against the patient.
 *
 * The file name is generated from the image id (never from the uploaded file
 * name), and the checksum is computed from the bytes actually written so the
 * read route can detect missing or altered storage.
 */
export async function uploadImage(
  db: PostgresJsDatabase<typeof schema>,
  userId: string,
  clinicId: string,
  input: UploadImageInput,
): Promise<{ imageId: string; patientId: string }> {
  const extension = ALLOWED_IMAGE_TYPES[input.file.type];
  if (!extension) {
    throw new Error("Only PNG and JPEG images can be attached.");
  }

  if (input.file.size === 0) {
    throw new Error("The selected file is empty.");
  }
  if (input.file.size > MAX_IMAGE_BYTES) {
    throw new Error(
      `Images must be under ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`,
    );
  }

  const [patient] = await db
    .select({ id: schema.patients.id })
    .from(schema.patients)
    .where(
      and(
        eq(schema.patients.id, input.patientId),
        eq(schema.patients.clinicId, clinicId),
      ),
    )
    .limit(1);

  if (!patient) {
    throw new Error("Patient not found in this clinic.");
  }

  if (input.chartId) {
    const [chart] = await db
      .select({ id: schema.dentalCharts.id })
      .from(schema.dentalCharts)
      .where(
        and(
          eq(schema.dentalCharts.id, input.chartId),
          eq(schema.dentalCharts.patientId, patient.id),
        ),
      )
      .limit(1);
    if (!chart) throw new Error("The selected dental chart does not belong to this patient.");
  }

  if (input.treatmentPlanItemId) {
    const [item] = await db
      .select({ id: schema.treatmentPlanItems.id })
      .from(schema.treatmentPlanItems)
      .where(
        and(
          eq(schema.treatmentPlanItems.id, input.treatmentPlanItemId),
          eq(schema.treatmentPlanItems.patientId, patient.id),
        ),
      )
      .limit(1);
    if (!item) throw new Error("The selected treatment plan item does not belong to this patient.");
  }

  const bytes = Buffer.from(await input.file.arrayBuffer());
  const checksum = createHash("sha256").update(bytes).digest("hex");

  const imageId = randomUUID();
  const fileKey = `${clinicId}/${patient.id}/${imageId}.${extension}`;
  const storagePath =
    process.env.IMAGE_STORAGE_PATH?.trim() || "./private/images";
  const absolutePath = `${storagePath}/${fileKey}`;

  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes);

  try {
    const [inserted] = await db
      .insert(schema.images)
      .values({
        id: imageId,
        clinicId,
        patientId: patient.id,
        category: input.category,
        fileKey,
        fileName: input.file.name.slice(0, 255) || `${imageId}.${extension}`,
        mimeType: input.file.type,
        checksum,
        sizeBytes: bytes.length,
        tooth: input.tooth ?? null,
        description: input.description ?? null,
        chartId: input.chartId ?? null,
        treatmentPlanItemId: input.treatmentPlanItemId ?? null,
        uploadedById: userId,
      })
      .returning({ id: schema.images.id, patientId: schema.images.patientId });

    if (!inserted) throw new Error("Failed to record the image.");
    return { imageId: inserted.id, patientId: inserted.patientId };
  } catch (error) {
    // Do not leave an orphaned file when the database write fails.
    await unlink(absolutePath).catch(() => undefined);
    throw error;
  }
}
