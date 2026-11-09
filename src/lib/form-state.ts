/**
 * Form state shared by server actions and their client forms.
 *
 * These values deliberately live outside the `"use server"` modules: Next.js
 * only allows async functions to be exported from a server-action file, so an
 * exported initial-state object there crashes every request that imports it.
 */

export type AuthState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string>;
};

export const initialAuthState: AuthState = { status: "idle" };

export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string>;
  resetKey?: number;
};

export const initialActionState: ActionState = { status: "idle" };

export type ImageUploadState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialImageUploadState: ImageUploadState = { status: "idle" };

export type BookingState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string>;
  confirmation?: {
    patientName: string;
    date: string;
    time: string;
    treatment: string;
  };
};

export const initialBookingState: BookingState = { status: "idle" };
