/**
 * Clinical reference data shared by the server and the odontogram.
 *
 * FDI notation is the default: quadrant 1–4, tooth position 1–8, so the permanent
 * dentition runs 18→11 (upper right), 21→28 (upper left), 48→41 (lower right),
 * 31→38 (lower left). Universal notation would instead number 1–32 clockwise.
 */
import type { ToothCondition } from "@/db/schema";

export const FDI_UPPER_RIGHT = ["18", "17", "16", "15", "14", "13", "12", "11"];
export const FDI_UPPER_LEFT = ["21", "22", "23", "24", "25", "26", "27", "28"];
export const FDI_LOWER_RIGHT = ["48", "47", "46", "45", "44", "43", "42", "41"];
export const FDI_LOWER_LEFT = ["31", "32", "33", "34", "35", "36", "37", "38"];

export const FDI_TEETH = [
  ...FDI_UPPER_RIGHT,
  ...FDI_UPPER_LEFT,
  ...FDI_LOWER_LEFT,
  ...FDI_LOWER_RIGHT,
];

export const SURFACES = ["M", "O", "D", "B", "L"] as const;
export type Surface = (typeof SURFACES)[number];

export const SURFACE_LABELS: Record<Surface, string> = {
  M: "Mesial",
  O: "Occlusal",
  D: "Distal",
  B: "Buccal",
  L: "Lingual",
};

type ConditionMeta = {
  label: string;
  short: string;
  /** Fill used inside the odontogram tooth. */
  fill: string;
  /** Text/legend colour on cream backgrounds. */
  ink: string;
  description: string;
};

export const TOOTH_CONDITIONS: Record<ToothCondition, ConditionMeta> = {
  caries: {
    label: "Caries",
    short: "Caries",
    fill: "#B4553F",
    ink: "#8C3F2C",
    description: "Active decay recorded during examination.",
  },
  restoration: {
    label: "Restoration",
    short: "Filling",
    fill: "#3E6B8A",
    ink: "#2F5468",
    description: "Composite, amalgam or glass ionomer restoration.",
  },
  crown: {
    label: "Crown",
    short: "Crown",
    fill: "#B08A4F",
    ink: "#8A6A38",
    description: "Full coverage restoration, including onlays.",
  },
  bridge: {
    label: "Bridge",
    short: "Bridge",
    fill: "#7B6A9B",
    ink: "#5F5180",
    description: "Fixed partial denture abutment or pontic.",
  },
  implant: {
    label: "Implant",
    short: "Implant",
    fill: "#2F6F5E",
    ink: "#245546",
    description: "Osseointegrated implant fixture.",
  },
  endo: {
    label: "Endodontic",
    short: "Endo",
    fill: "#A8683F",
    ink: "#855033",
    description: "Root canal treatment, completed or in progress.",
  },
  fracture: {
    label: "Fracture",
    short: "Fracture",
    fill: "#8A4A4A",
    ink: "#6B3737",
    description: "Cracked tooth syndrome or structural fracture.",
  },
  sealant: {
    label: "Sealant",
    short: "Sealant",
    fill: "#5B8C7B",
    ink: "#456C5F",
    description: "Preventive fissure sealant.",
  },
  missing: {
    label: "Missing",
    short: "Missing",
    fill: "#B9AE9C",
    ink: "#6F6656",
    description: "Extracted, congenitally absent or unerupted.",
  },
};

export const TOOTH_CONDITION_ORDER: ToothCondition[] = [
  "caries",
  "restoration",
  "crown",
  "bridge",
  "endo",
  "implant",
  "fracture",
  "sealant",
  "missing",
];

/** Upper-left/lower-left quadrant teeth are drawn right-to-left in the arch. */
export function quadrantOf(tooth: string): number {
  return Number(tooth[0]);
}

export function isUpper(tooth: string): boolean {
  const quadrant = quadrantOf(tooth);
  return quadrant === 1 || quadrant === 2;
}

/** Formats a tooth label for humans: "46" → "Tooth 46". */
export function toothLabel(tooth: string): string {
  return `Tooth ${tooth}`;
}
