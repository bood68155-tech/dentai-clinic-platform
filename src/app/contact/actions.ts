"use server";

import type { ContactState } from "@/lib/form-state";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * The public contact form.
 *
 * Everything is validated on the server so the page can never acknowledge a
 * message it would not have accepted. The message is written to the function
 * log: this deployment has no mail provider wired up yet, so replace the
 * `console.info` below with the front-desk inbox or CRM call when one exists.
 */
export async function sendContactMessageAction(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = text(formData, "name");
  const email = text(formData, "email");
  const phone = text(formData, "phone");
  const topic = text(formData, "topic");
  const message = text(formData, "message");

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Add your name so we know who to reply to.";
  if (!email) {
    errors.email = "Add an email address so we can write back.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "That email address does not look right.";
  }
  if (phone && phone.replace(/\D/g, "").length < 7) {
    errors.phone = "That phone number looks too short.";
  }
  if (!message) errors.message = "A sentence or two is plenty.";
  if (message.length > 2000) errors.message = "Please keep it under 2000 characters.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }

  console.info("contact message", { name, email, phone, topic, message });

  return {
    status: "success",
    message: "Thank you! Your submission has been received!",
  };
}
