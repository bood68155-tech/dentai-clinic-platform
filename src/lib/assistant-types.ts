/**
 * Wire types for the conversational assistant.
 *
 * Kept free of `server-only` imports so the widget and the route handler can
 * share one description of the request/response contract.
 */

export type AssistantRole = "user" | "assistant";

export type AssistantMessage = {
  role: AssistantRole;
  content: string;
};

/** Confirmation returned once the assistant has written an appointment. */
export type AssistantBooking = {
  patientName: string;
  date: string;
  time: string;
  treatment: string;
};

export type AssistantReply = {
  reply: string;
  booking?: AssistantBooking;
};

export type AssistantErrorBody = {
  error: string;
  message: string;
};
