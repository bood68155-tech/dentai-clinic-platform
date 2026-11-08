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
import { getClinic } from "@/db/queries";
import { FDI_TEETH, TOOTH_CONDITIONS } from "@/lib/dental";

export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string>;
  resetKey?: number;
};

export const initialActionState: ActionState = { status: "idle" };

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
