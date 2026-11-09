import type { ImagingCategory } from "@/db/schema";

export const IMAGING_CATEGORIES: ImagingCategory[] = [
  "panoramic",
  "periapical",
  "bitewing",
  "occlusal",
  "cbct",
  "extraoral",
  "intraoral",
  "photo",
  "lab",
  "document",
];

export const IMAGING_CATEGORY_LABELS: Record<ImagingCategory, string> = {
  panoramic: "Panoramic X-ray",
  periapical: "Periapical X-ray",
  bitewing: "Bitewing X-ray",
  occlusal: "Occlusal X-ray",
  cbct: "CBCT scan",
  extraoral: "Extraoral photo",
  intraoral: "Intraoral photo",
  photo: "Clinical photo",
  lab: "Lab document",
  document: "Document",
};

export function imagingCategoryLabel(category: string): string {
  return IMAGING_CATEGORY_LABELS[category as ImagingCategory] ?? category;
}
