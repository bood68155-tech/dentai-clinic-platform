/**
 * Seeds a demo clinic so the dashboard has something to show on first run.
 *
 *   npm run db:push   # create the tables
 *   npm run db:seed   # load demo data
 *
 * The script is idempotent: it removes only the demo clinic (`slug =
 * 'dentai-demo'`) and recreates it, leaving any real clinic data untouched.
 */
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../src/db/schema";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is missing. Add it to .env.local first.");
  process.exit(1);
}

const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
const db = drizzle(client, { schema });
const CLINIC_SLUG = "dentai-demo";
const TIMEZONE = "America/New_York";

/** Wall-clock time in the clinic's timezone → the matching UTC instant. */
function zonedDate(day: string, hour: number, minute = 0): Date {
  const naive = new Date(`${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(naive);

  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second"));
  const offset = asUtc - naive.getTime();
  return new Date(naive.getTime() - offset);
}

function today(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function shiftDay(day: string, days: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function main() {
  console.log("· removing previous demo clinic (if any)");
  await db.delete(schema.clinics).where(eq(schema.clinics.slug, CLINIC_SLUG));

  const [clinic] = await db
    .insert(schema.clinics)
    .values({
      name: "Dentai Clinic",
      slug: CLINIC_SLUG,
      phone: "+1 (212) 555-0184",
      email: "hello@dentaiclinic.com",
      address: "118 Greene Street, Suite 4, New York, NY",
      timezone: TIMEZONE,
      currency: "USD",
      workingHours: {
        mon: ["09:00", "18:00"],
        tue: ["09:00", "18:00"],
        wed: ["09:00", "18:00"],
        thu: ["09:00", "19:00"],
        fri: ["09:00", "16:00"],
        sat: ["09:00", "13:00"],
      },
    })
    .returning();

  console.log("· clinic", clinic.name);

  const practitioners = await db
    .insert(schema.users)
    .values([
      {
        clinicId: clinic.id,
        fullName: "Dr. Maya Haddad",
        email: "maya.haddad@dentaiclinic.com",
        role: "owner",
        specialty: "Restorative dentistry",
        licenseNumber: "NY-448210",
        color: "#2F6F5E",
      },
      {
        clinicId: clinic.id,
        fullName: "Dr. Elias Rahal",
        email: "elias.rahal@dentaiclinic.com",
        role: "dentist",
        specialty: "Endodontics",
        licenseNumber: "NY-512907",
        color: "#3E6B8A",
      },
      {
        clinicId: clinic.id,
        fullName: "Noor Salem",
        email: "noor.salem@dentaiclinic.com",
        role: "hygienist",
        specialty: "Preventive care",
        color: "#B08A4F",
      },
      {
        clinicId: clinic.id,
        fullName: "Lena Ortiz",
        email: "lena.ortiz@dentaiclinic.com",
        role: "receptionist",
        color: "#7B6A9B",
      },
    ])
    .returning();

  const [maya, elias, noor] = practitioners;

  const operatories = await db
    .insert(schema.operatories)
    .values([
      { clinicId: clinic.id, name: "Suite 1 · Restorative", color: "#2F6F5E", sortOrder: 1 },
      { clinicId: clinic.id, name: "Suite 2 · Endodontics", color: "#3E6B8A", sortOrder: 2 },
      { clinicId: clinic.id, name: "Suite 3 · Hygiene", color: "#B08A4F", sortOrder: 3 },
    ])
    .returning();

  const treatments = await db
    .insert(schema.treatmentTypes)
    .values([
      { clinicId: clinic.id, code: "D0120", name: "Periodic exam", category: "diagnostic", durationMinutes: 20, defaultFee: "65", color: "#3E6B8A" },
      { clinicId: clinic.id, code: "D1110", name: "Adult prophylaxis", category: "hygiene", durationMinutes: 45, defaultFee: "130", color: "#2F6F5E" },
      { clinicId: clinic.id, code: "D0274", name: "Bitewing radiographs", category: "diagnostic", durationMinutes: 15, defaultFee: "90", color: "#7B6A9B" },
      { clinicId: clinic.id, code: "D2391", name: "Composite · one surface", category: "restorative", durationMinutes: 45, defaultFee: "195", color: "#B08A4F" },
      { clinicId: clinic.id, code: "D2740", name: "Crown · porcelain/ceramic", category: "restorative", durationMinutes: 90, defaultFee: "1250", color: "#B08A4F" },
      { clinicId: clinic.id, code: "D3310", name: "Root canal · anterior", category: "endodontic", durationMinutes: 90, defaultFee: "850", color: "#A8683F" },
      { clinicId: clinic.id, code: "D6010", name: "Implant placement", category: "surgical", durationMinutes: 120, defaultFee: "3200", color: "#2F6F5E" },
      { clinicId: clinic.id, code: "D7140", name: "Extraction · erupted tooth", category: "surgical", durationMinutes: 40, defaultFee: "240", color: "#8A4A4A" },
    ])
    .returning();

  const treatmentByCode = new Map(treatments.map((treatment) => [treatment.code, treatment]));

  const patientRows = await db
    .insert(schema.patients)
    .values([
      {
        clinicId: clinic.id,
        firstName: "Amelia",
        lastName: "Fontaine",
        dateOfBirth: "1990-04-18",
        gender: "female",
        email: "amelia.fontaine@example.com",
        phone: "+1 (212) 555-0117",
        address: "42 Bleecker Street, New York, NY",
        occupation: "Architect",
        medicalAlerts: ["allergy: penicillin", "pregnancy"],
        allergies: "Penicillin — rash",
        medicalNotes: "Currently in second trimester. Avoid elective radiographs.",
        referralSource: "Google",
        insuranceCarrier: "Delta Dental",
        insuranceMemberId: "DD-884120",
        notes: "Prefers morning appointments. Anxious about the handpiece.",
      },
      {
        clinicId: clinic.id,
        firstName: "Marcus",
        lastName: "Oyelaran",
        dateOfBirth: "1978-11-02",
        gender: "male",
        email: "marcus.oyelaran@example.com",
        phone: "+1 (212) 555-0192",
        address: "9 Cornelia Street, New York, NY",
        occupation: "Chef",
        medicalAlerts: ["hypertension", "anticoagulants"],
        medicalNotes: "On apixaban. Coordinate with GP before surgical treatment.",
        referralSource: "Friend",
        insuranceCarrier: "Cigna",
        insuranceMemberId: "CG-330219",
      },
      {
        clinicId: clinic.id,
        firstName: "Sofia",
        lastName: "Lindqvist",
        dateOfBirth: "2001-07-23",
        gender: "female",
        email: "sofia.lindqvist@example.com",
        phone: "+1 (212) 555-0164",
        address: "77 Greenwich Avenue, New York, NY",
        occupation: "Student",
        medicalAlerts: [],
        referralSource: "Instagram",
      },
      {
        clinicId: clinic.id,
        firstName: "Tobias",
        lastName: "Meyer",
        dateOfBirth: "1965-01-09",
        gender: "male",
        email: "tobias.meyer@example.com",
        phone: "+1 (212) 555-0128",
        address: "210 West 4th Street, New York, NY",
        occupation: "Publisher",
        medicalAlerts: ["type-2 diabetes"],
        medicalNotes: "HbA1c 7.4 — monitor healing after extractions.",
        referralSource: "Walk-in",
        insuranceCarrier: "MetLife",
        insuranceMemberId: "ML-771005",
      },
      {
        clinicId: clinic.id,
        firstName: "Priya",
        lastName: "Raman",
        dateOfBirth: "1987-09-30",
        gender: "female",
        email: "priya.raman@example.com",
        phone: "+1 (212) 555-0143",
        address: "5 Jane Street, New York, NY",
        occupation: "Product designer",
        medicalAlerts: ["allergy: latex"],
        allergies: "Latex — contact dermatitis",
        referralSource: "Google",
      },
      {
        clinicId: clinic.id,
        firstName: "Daniel",
        lastName: "Okafor",
        dateOfBirth: "1995-03-14",
        gender: "male",
        email: "daniel.okafor@example.com",
        phone: "+1 (212) 555-0175",
        address: "301 West 12th Street, New York, NY",
        occupation: "Cyclist",
        medicalAlerts: [],
        referralSource: "Friend",
        notes: "Sports guard fitting requested.",
      },
    ])
    .returning();

  const [amelia, marcus, sofia, tobias, priya, daniel] = patientRows;
  console.log("· patients", patientRows.length);

  const day = today();
  const at = (hour: number, minute = 0) => zonedDate(day, hour, minute);

  const slot = (hour: number, minute: number, minutes: number) => {
    const start = at(hour, minute);
    return { startsAt: start, endsAt: new Date(start.getTime() + minutes * 60_000) };
  };

  await db.insert(schema.appointments).values([
    {
      clinicId: clinic.id,
      patientId: amelia.id,
      practitionerId: maya.id,
      operatoryId: operatories[0].id,
      treatmentTypeId: treatmentByCode.get("D2391")!.id,
      ...slot(9, 0, 45),
      status: "completed",
      kind: "treatment",
      reason: "Composite on 26 — distal caries",
      notes: "Used rubber dam, no anaesthetic complications.",
    },
    {
      clinicId: clinic.id,
      patientId: tobias.id,
      practitionerId: elias.id,
      operatoryId: operatories[1].id,
      treatmentTypeId: treatmentByCode.get("D3310")!.id,
      ...slot(9, 30, 90),
      status: "in_chair",
      kind: "treatment",
      reason: "Non-vital 36, single visit endo",
    },
    {
      clinicId: clinic.id,
      patientId: sofia.id,
      practitionerId: noor.id,
      operatoryId: operatories[2].id,
      treatmentTypeId: treatmentByCode.get("D1110")!.id,
      ...slot(10, 0, 45),
      status: "arrived",
      kind: "hygiene",
      reason: "Six-month recall",
    },
    {
      clinicId: clinic.id,
      patientId: marcus.id,
      practitionerId: maya.id,
      operatoryId: operatories[0].id,
      treatmentTypeId: treatmentByCode.get("D0274")!.id,
      ...slot(11, 0, 15),
      status: "scheduled",
      kind: "consultation",
      reason: "Pre-surgical radiographs",
    },
    {
      clinicId: clinic.id,
      patientId: priya.id,
      practitionerId: noor.id,
      operatoryId: operatories[2].id,
      treatmentTypeId: treatmentByCode.get("D0120")!.id,
      ...slot(11, 30, 20),
      status: "confirmed",
      kind: "consultation",
      reason: "New patient exam",
    },
    {
      clinicId: clinic.id,
      patientId: daniel.id,
      practitionerId: maya.id,
      operatoryId: operatories[0].id,
      treatmentTypeId: treatmentByCode.get("D2740")!.id,
      ...slot(13, 0, 90),
      status: "scheduled",
      kind: "treatment",
      reason: "Crown prep on 16",
    },
    {
      clinicId: clinic.id,
      patientId: null,
      practitionerId: maya.id,
      operatoryId: operatories[0].id,
      ...slot(12, 0, 60),
      status: "scheduled",
      kind: "lunch",
      title: "Lunch",
    },
    {
      clinicId: clinic.id,
      patientId: null,
      practitionerId: elias.id,
      operatoryId: operatories[1].id,
      ...slot(15, 0, 60),
      status: "scheduled",
      kind: "block",
      title: "Lab case review",
      notes: "Crown returns from Arcade Dental Lab.",
    },
    // Tomorrow's book, so the day navigation has something to show.
    {
      clinicId: clinic.id,
      patientId: marcus.id,
      practitionerId: elias.id,
      operatoryId: operatories[1].id,
      treatmentTypeId: treatmentByCode.get("D7140")!.id,
      startsAt: zonedDate(shiftDay(day, 1), 9, 30),
      endsAt: zonedDate(shiftDay(day, 1), 10, 10),
      status: "scheduled",
      kind: "treatment",
      reason: "Extraction 38 — partially erupted",
    },
    {
      clinicId: clinic.id,
      patientId: sofia.id,
      practitionerId: noor.id,
      operatoryId: operatories[2].id,
      treatmentTypeId: treatmentByCode.get("D1110")!.id,
      startsAt: zonedDate(shiftDay(day, 1), 11, 0),
      endsAt: zonedDate(shiftDay(day, 1), 11, 45),
      status: "scheduled",
      kind: "hygiene",
    },
  ]);

  console.log("· agenda seeded for", day);

  // ── Dental charts ────────────────────────────────────────────────────
  const [ameliaChart] = await db
    .insert(schema.dentalCharts)
    .values({
      clinicId: clinic.id,
      patientId: amelia.id,
      chartedById: maya.id,
      notation: "fdi",
      notes: "Full mouth series taken. Pregnancy-safe technique used.",
      recordedAt: at(9, 5),
    })
    .returning();

  const [marcusChart] = await db
    .insert(schema.dentalCharts)
    .values({
      clinicId: clinic.id,
      patientId: marcus.id,
      chartedById: elias.id,
      notation: "fdi",
      notes: "Baseline chart before surgical planning.",
      recordedAt: zonedDate(shiftDay(day, -7), 14, 0),
    })
    .returning();

  await db.insert(schema.toothRecords).values([
    { chartId: ameliaChart.id, patientId: amelia.id, tooth: "26", quadrant: 2, condition: "caries", surfaces: ["D", "O"], status: "existing", notes: "Distal caries confirmed on bitewing.", recordedById: maya.id, recordedAt: at(9, 6) },
    { chartId: ameliaChart.id, patientId: amelia.id, tooth: "16", quadrant: 1, condition: "restoration", surfaces: ["O"], status: "existing", recordedById: maya.id, recordedAt: at(9, 7) },
    { chartId: ameliaChart.id, patientId: amelia.id, tooth: "36", quadrant: 3, condition: "endo", surfaces: ["O"], status: "existing", notes: "Root canal completed 2021.", recordedById: maya.id, recordedAt: at(9, 7) },
    { chartId: ameliaChart.id, patientId: amelia.id, tooth: "38", quadrant: 3, condition: "missing", surfaces: [], status: "existing", notes: "Extracted 2019.", recordedById: maya.id, recordedAt: at(9, 8) },
    { chartId: ameliaChart.id, patientId: amelia.id, tooth: "11", quadrant: 1, condition: "sealant", surfaces: ["O"], status: "existing", recordedById: noor.id, recordedAt: at(9, 8) },
    { chartId: marcusChart.id, patientId: marcus.id, tooth: "46", quadrant: 4, condition: "crown", surfaces: [], status: "existing", notes: "Zirconia crown seated 2023.", recordedById: elias.id, recordedAt: zonedDate(shiftDay(day, -7), 14, 5) },
    { chartId: marcusChart.id, patientId: marcus.id, tooth: "36", quadrant: 3, condition: "caries", surfaces: ["O"], status: "existing", notes: "Deep caries, endo indicated.", recordedById: elias.id, recordedAt: zonedDate(shiftDay(day, -7), 14, 8) },
    { chartId: marcusChart.id, patientId: marcus.id, tooth: "47", quadrant: 4, condition: "restoration", surfaces: ["O", "M"], status: "existing", recordedById: elias.id, recordedAt: zonedDate(shiftDay(day, -7), 14, 9) },
    { chartId: marcusChart.id, patientId: marcus.id, tooth: "24", quadrant: 2, condition: "implant", surfaces: [], status: "existing", notes: "Implant placed 2022, restored.", recordedById: elias.id, recordedAt: zonedDate(shiftDay(day, -7), 14, 10) },
    { chartId: marcusChart.id, patientId: marcus.id, tooth: "37", quadrant: 3, condition: "fracture", surfaces: ["M"], status: "existing", recordedById: elias.id, recordedAt: zonedDate(shiftDay(day, -7), 14, 11) },
  ]);

  console.log("· dental charts seeded");

  await db.insert(schema.treatmentPlanItems).values([
    {
      clinicId: clinic.id,
      patientId: amelia.id,
      treatmentTypeId: treatmentByCode.get("D2740")!.id,
      tooth: "26",
      fee: "1250",
      status: "accepted",
      sequence: 1,
      notes: "Crown after composite failure risk review.",
    },
    {
      clinicId: clinic.id,
      patientId: amelia.id,
      treatmentTypeId: treatmentByCode.get("D1110")!.id,
      fee: "130",
      status: "planned",
      sequence: 2,
      notes: "Defer until second trimester ends.",
    },
    {
      clinicId: clinic.id,
      patientId: marcus.id,
      treatmentTypeId: treatmentByCode.get("D3310")!.id,
      tooth: "36",
      fee: "850",
      status: "accepted",
      sequence: 1,
    },
    {
      clinicId: clinic.id,
      patientId: marcus.id,
      treatmentTypeId: treatmentByCode.get("D7140")!.id,
      tooth: "38",
      fee: "240",
      status: "planned",
      sequence: 2,
      notes: "Confirm apixaban hold with GP.",
    },
    {
      clinicId: clinic.id,
      patientId: daniel.id,
      treatmentTypeId: treatmentByCode.get("D2740")!.id,
      tooth: "16",
      fee: "1250",
      status: "planned",
      sequence: 1,
    },
  ]);

  await db.insert(schema.clinicalNotes).values([
    {
      clinicId: clinic.id,
      patientId: amelia.id,
      appointmentId: null,
      authorId: maya.id,
      body: "Discussed pregnancy-safe treatment sequencing. Patient comfortable deferring elective work; caries on 26 monitored at each visit.",
      notedAt: at(9, 20),
    },
    {
      clinicId: clinic.id,
      patientId: marcus.id,
      authorId: elias.id,
      body: "Referred to GP for anticoagulant guidance. No surgical treatment until haematology sign-off is on file.",
      notedAt: zonedDate(shiftDay(day, -7), 14, 20),
    },
    {
      clinicId: clinic.id,
      patientId: sofia.id,
      authorId: noor.id,
      body: "Excellent plaque control. Reviewed interdental cleaning technique and fluoride varnish schedule.",
      notedAt: zonedDate(shiftDay(day, -30), 10, 45),
    },
  ]);

  console.log("\n✓ Demo clinic ready —", {
    clinic: clinic.slug,
    practitioners: practitioners.length,
    operatories: operatories.length,
    treatments: treatments.length,
    patients: patientRows.length,
  });

  await client.end();
  process.exit(0);
}

main().catch(async (error) => {
  console.error("Seed failed:", error);
  await client.end({ timeout: 1 }).catch(() => {});
  process.exit(1);
});
