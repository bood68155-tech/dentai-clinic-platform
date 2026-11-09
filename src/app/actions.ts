"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import {
  dentalCharts,
  patients,
  toothRecords,
  type ToothCondition,
  type ToothStatus,
} from "@/db/schema";
import { uploadImage } from "@/db/mutations";
import { getClinic, getPatient } from "@/db/queries";
import type { ImagingCategory } from "@/db/schema";
import { requireStaffUser } from "@/lib/auth";
import { FDI_TEETH, TOOTH_CONDITIONS } from "@/lib/dental";
import type { ActionState, ImageUploadState } from "@/lib/form-state";
import { IMAGING_CATEGORIES } from "@/lib/imaging";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(formData: FormData, key: string): string | null {
  const value = text(formData, key);
  return value.length > 0 ? value : null;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export async function createPatientAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Mutating clinical records requires a staff session. The redirect throws,
  // which is why this runs before any try/catch.
  await requireStaffUser();

  const firstName = text(formData, "firstName");
  const lastName = text(formData, "lastName");
  const email = text(formData, "email");
  const dateOfBirth = text(formData, "dateOfBirth");
  const alertsRaw = text(formData, "medicalAlerts");

  const errors: Record<string, string> = {};
  if (!firstName) errors.firstName = "First name is required.";
  if (!lastName) errors.lastName = "Last name is required.";
  if (email && !isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (dateOfBirth && Number.isNaN(new Date(dateOfBirth).getTime())) {
    errors.dateOfBirth = "Enter a valid date.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please fix the highlighted fields.", errors };
  }

  let patientId: string;
  try {
    const clinic = await getClinic();
    if (!clinic) {
      return {
        status: "error",
        message: "No clinic found. Run `npm run db:seed` to create the demo clinic.",
      };
    }

    const db = getDb();
    const [created] = await db
      .insert(patients)
      .values({
        clinicId: clinic.id,
        firstName,
        lastName,
        email: email || null,
        phone: optionalText(formData, "phone"),
        dateOfBirth: dateOfBirth || null,
        gender: optionalText(formData, "gender"),
        address: optionalText(formData, "address"),
        occupation: optionalText(formData, "occupation"),
        medicalAlerts: alertsRaw
          ? alertsRaw
              .split(",")
              .map((alert) => alert.trim())
              .filter(Boolean)
          : [],
        medicalNotes: optionalText(formData, "medicalNotes"),
        referralSource: optionalText(formData, "referralSource"),
      })
      .returning({ id: patients.id });

    patientId = created.id;
  } catch (error) {
    console.error("createPatientAction failed", error);
    return {
      status: "error",
      message: "Could not save the patient. Check the database connection and try again.",
    };
  }

  revalidatePath("/clinic/patients");
  revalidatePath("/clinic");
  redirect(`/clinic/patients/${patientId}`);
}

export async function recordToothConditionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaffUser();

  const patientId = text(formData, "patientId");
  const tooth = text(formData, "tooth");
  const condition = text(formData, "condition") as ToothCondition;
  const status = (text(formData, "status") || "existing") as ToothStatus;
  const surfaces = formData
    .getAll("surfaces")
    .filter((value): value is string => typeof value === "string" && value.length > 0);
  const notes = optionalText(formData, "notes");

  if (!patientId) return { status: "error", message: "Missing patient." };
  if (!FDI_TEETH.includes(tooth)) {
    return { status: "error", message: "Select a tooth from the chart first." };
  }
  if (!condition || !(condition in TOOTH_CONDITIONS)) {
    return { status: "error", message: "Choose a clinical finding." };
  }

  try {
    const clinic = await getClinic();
    if (!clinic) {
      return {
        status: "error",
        message: "No clinic found. Run `npm run db:seed` to create the demo clinic.",
      };
    }

    const db = getDb();

    const [existingChart] = await db
      .select({ id: dentalCharts.id })
      .from(dentalCharts)
      .where(
        and(eq(dentalCharts.patientId, patientId), eq(dentalCharts.clinicId, clinic.id)),
      )
      .orderBy(desc(dentalCharts.recordedAt))
      .limit(1);

    const chartId =
      existingChart?.id ??
      (
        await db
          .insert(dentalCharts)
          .values({ clinicId: clinic.id, patientId, notation: "fdi" })
          .returning({ id: dentalCharts.id })
      )[0].id;

    await db
      .insert(toothRecords)
      .values({
        chartId,
        patientId,
        tooth,
        quadrant: Number(tooth[0]),
        condition,
        surfaces,
        status,
        notes,
      })
      .onConflictDoUpdate({
        target: [toothRecords.chartId, toothRecords.tooth, toothRecords.condition],
        set: { surfaces, status, notes, recordedAt: new Date() },
      });

    revalidatePath(`/clinic/patients/${patientId}/chart`);
    revalidatePath(`/clinic/patients/${patientId}`);
    revalidatePath("/clinic");

    return {
      status: "success",
      message: `${TOOTH_CONDITIONS[condition].label} recorded on tooth ${tooth}.`,
      resetKey: Date.now(),
    };
  } catch (error) {
    console.error("recordToothConditionAction failed", error);
    return {
      status: "error",
      message: "Could not save the finding. Check the database connection and try again.",
    };
  }
}

/** Attach an X-ray or clinical photo to a patient record. Staff only. */
export async function uploadImageAction(
  _prevState: ImageUploadState,
  formData: FormData,
): Promise<ImageUploadState> {
  const user = await requireStaffUser();

  const patientId = text(formData, "patientId");
  const category = text(formData, "category") as ImagingCategory;
  const tooth = optionalText(formData, "tooth");
  const description = optionalText(formData, "description");
  const chartId = optionalText(formData, "chartId");
  const treatmentPlanItemId = optionalText(formData, "planItemId");
  const file = formData.get("file");

  if (!patientId) return { status: "error", message: "Missing patient." };
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose an image to attach." };
  }
  if (!IMAGING_CATEGORIES.includes(category)) {
    return { status: "error", message: "Choose a valid image category." };
  }
  if (tooth && !/^\d{1,2}$/.test(tooth)) {
    return { status: "error", message: "Use a two-digit FDI tooth number, for example 11 or 46." };
  }
  if (description && description.length > 1000) {
    return { status: "error", message: "Keep the description under 1000 characters." };
  }

  try {
    const clinic = await getClinic();
    if (!clinic) {
      return { status: "error", message: "No clinic found. Seed the practice and try again." };
    }

    const patient = await getPatient(clinic.id, patientId);
    if (!patient) {
      return { status: "error", message: "Patient not found." };
    }

    await uploadImage(getDb(), user.id, clinic.id, {
      patientId: patient.id,
      file,
      category,
      tooth: tooth || null,
      description: description || null,
      chartId: chartId || null,
      treatmentPlanItemId: treatmentPlanItemId || null,
    });
  } catch (error) {
    console.error("uploadImageAction failed", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Could not attach the image. Check the storage path and try again.",
    };
  }

  revalidatePath(`/clinic/patients/${patientId}`);
  revalidatePath(`/clinic/patients/${patientId}/imaging`);

  return { status: "success", message: "Image attached to the patient record." };
}
