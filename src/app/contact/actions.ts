"use server";

import type { ContactState } from "@/lib/form-state";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * The public contact form.
 *
 * Mirrors the reference form's fields — first name, last name, email, phone,
 * how you heard about us, subject and message — and validates every one of
 * them on the server so the page never acknowledges a message it would not
 * have accepted. There is no mail provider in this deployment yet, so the
 * submission is written to the function log; swap the `console.info` for the
 * front-desk inbox or CRM call when one exists.
 */
export async function sendContactMessageAction(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const firstName = text(formData, "firstName");
  const lastName = text(formData, "lastName");
  const email = text(formData, "email");
  const phone = text(formData, "phone");
  const hear = text(formData, "hear");
  const subject = text(formData, "subject");
  const message = text(formData, "message");

  const errors: Record<string, string> = {};
  if (!firstName) errors.firstName = "Required";
  if (!lastName) errors.lastName = "Required";
  if (!email) {
    errors.email = "Required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Enter a valid email address";
  }
  if (phone && phone.replace(/\D/g, "").length < 7) {
    errors.phone = "Enter a valid phone number";
  }
  if (!subject) errors.subject = "Required";
  if (!message) {
    errors.message = "Required";
  } else if (message.length > 5000) {
    errors.message = "Keep it under 5000 characters";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please complete the required fields.", errors };
  }

  console.info("contact message", {
    name: `${firstName} ${lastName}`.trim(),
    email,
    phone,
    hear,
    subject,
    message,
  });

  return {
    status: "success",
    message: "Thank you! Your submission has been received!",
  };
}
