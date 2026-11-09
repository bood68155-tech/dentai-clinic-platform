"use server";

import { revalidatePath } from "next/cache";

import { getDb } from "@/db";
import { requestAppointment } from "@/db/mutations";
import { getClinic } from "@/db/queries";
import type { BookingState } from "@/lib/form-state";
import { formatDate, formatTime } from "@/lib/utils";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function bookAppointmentAction(
  _prevState: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const firstName = text(formData, "firstName");
  const lastName = text(formData, "lastName");
  const email = text(formData, "email");
  const phone = text(formData, "phone");
  const preferredDate = text(formData, "preferredDate");
  const preferredTime = text(formData, "preferredTime");
  const treatmentTypeId = text(formData, "treatmentTypeId");
  const notes = text(formData, "notes");

  const errors: Record<string, string> = {};
  if (!firstName) errors.firstName = "First name is required.";
  if (!lastName) errors.lastName = "Last name is required.";
  if (!email && !phone) {
    errors.phone = "Add a phone number or an email so we can confirm.";
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!preferredDate || !DATE_PATTERN.test(preferredDate)) {
    errors.preferredDate = "Choose a preferred date.";
  }
  if (!preferredTime || !TIME_PATTERN.test(preferredTime)) {
    errors.preferredTime = "Choose a preferred time.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please complete the highlighted fields.", errors };
  }

  try {
    const clinic = await getClinic();
    if (!clinic) {
      return {
        status: "error",
        message:
          "The clinic has not finished setting up its calendar. Please call us to book instead.",
      };
    }

    const result = await requestAppointment(getDb(), clinic.id, {
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      treatmentTypeId: treatmentTypeId || null,
      preferredDate,
      preferredTime,
      notes: notes || null,
      timeZone: clinic.timezone,
    });

    revalidatePath("/clinic");
    revalidatePath("/clinic/appointments");
    revalidatePath("/clinic/patients");

    return {
      status: "success",
      message: "Request received.",
      confirmation: {
        patientName: `${firstName} ${lastName}`,
        date: formatDate(result.startsAt, clinic.timezone, {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
        time: formatTime(result.startsAt, clinic.timezone),
        treatment: result.treatmentName ?? "General check-up",
      },
    };
  } catch (error) {
    console.error("bookAppointmentAction failed", error);
    const message =
      error instanceof Error && error.message.includes("future")
        ? "That time has already passed — choose a later slot."
        : "We could not submit the request. Please call the clinic and we will book you in.";

    return { status: "error", message };
  }
}
