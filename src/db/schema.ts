/**
 * Dentai clinic schema.
 *
 * Modelling notes
 * ---------------
 * - Every clinical row is scoped to a `clinic`, so a single deployment can host
 *   several practices (Smiluster models this with a license per clinic).
 * - Odontograms are versioned: a `dental_charts` row is one snapshot of a
 *   patient's mouth, and `tooth_records` are the findings inside it. Findings are
 *   appended (never overwritten) so the chart keeps a clinical history.
 * - Teeth use FDI two-digit notation by default (`11`–`48`); `notation` on the
 *   chart allows Universal numbering (`1`–`32`) for US practices.
 * - Money is stored as `numeric(12, 2)` in the clinic currency.
 */
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "owner",
  "dentist",
  "hygienist",
  "assistant",
  "receptionist",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "confirmed",
  "arrived",
  "in_chair",
  "completed",
  "no_show",
  "cancelled",
]);

export const appointmentKindEnum = pgEnum("appointment_kind", [
  "treatment",
  "consultation",
  "hygiene",
  "break",
  "lunch",
  "block",
]);

export const chartNotationEnum = pgEnum("chart_notation", ["fdi", "universal"]);

export const toothConditionEnum = pgEnum("tooth_condition", [
  "caries",
  "restoration",
  "crown",
  "bridge",
  "implant",
  "endo",
  "fracture",
  "sealant",
  "missing",
]);

export const toothStatusEnum = pgEnum("tooth_status", [
  "existing",
  "planned",
  "completed",
]);

export const treatmentStatusEnum = pgEnum("treatment_status", [
  "planned",
  "accepted",
  "completed",
  "declined",
]);

// ── Practice ───────────────────────────────────────────────────────────

export const clinics = pgTable(
  "clinics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: varchar("slug", { length: 64 }).notNull(),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    timezone: text("timezone").notNull().default("UTC"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    /** { "mon": ["09:00", "18:00"], ... } */
    workingHours: jsonb("working_hours").$type<Record<string, [string, string]>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("clinics_slug_idx").on(table.slug)],
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    role: userRoleEnum("role").notNull().default("dentist"),
    specialty: text("specialty"),
    licenseNumber: text("license_number"),
    /** Hex colour used to tint this practitioner's agenda column. */
    color: varchar("color", { length: 7 }).notNull().default("#16332A"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    index("users_clinic_idx").on(table.clinicId),
  ],
);

export const operatories = pgTable(
  "operatories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: varchar("color", { length: 7 }).notNull().default("#A8B5A2"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("operatories_clinic_idx").on(table.clinicId, table.sortOrder)],
);

export const treatmentTypes = pgTable(
  "treatment_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    /** ADA/CDT code, e.g. `D1110`, or a short practice label. */
    code: varchar("code", { length: 16 }).notNull(),
    name: text("name").notNull(),
    category: text("category").notNull().default("general"),
    durationMinutes: integer("duration_minutes").notNull().default(30),
    defaultFee: numeric("default_fee", { precision: 12, scale: 2 }).notNull().default("0"),
    color: varchar("color", { length: 7 }).notNull().default("#A8B5A2"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("treatment_types_clinic_code_idx").on(table.clinicId, table.code),
  ],
);

// ── Patients ───────────────────────────────────────────────────────────

export const patients = pgTable(
  "patients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    dateOfBirth: date("date_of_birth"),
    gender: text("gender"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    occupation: text("occupation"),
    /** Free-text tags surfaced as alert badges: ['allergy: penicillin', 'anticoagulants']. */
    medicalAlerts: text("medical_alerts").array().notNull().default([]),
    allergies: text("allergies"),
    medicalNotes: text("medical_notes"),
    notes: text("notes"),
    referralSource: text("referral_source"),
    insuranceCarrier: text("insurance_carrier"),
    insuranceMemberId: text("insurance_member_id"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("patients_clinic_name_idx").on(table.clinicId, table.lastName, table.firstName),
    index("patients_clinic_phone_idx").on(table.clinicId, table.phone),
  ],
);

// ── Scheduling ─────────────────────────────────────────────────────────

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id").references(() => patients.id, { onDelete: "set null" }),
    practitionerId: uuid("practitioner_id").references(() => users.id, {
      onDelete: "set null",
    }),
    operatoryId: uuid("operatory_id").references(() => operatories.id, {
      onDelete: "set null",
    }),
    treatmentTypeId: uuid("treatment_type_id").references(() => treatmentTypes.id, {
      onDelete: "set null",
    }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: appointmentStatusEnum("status").notNull().default("scheduled"),
    kind: appointmentKindEnum("kind").notNull().default("treatment"),
    /** Overrides the treatment name for blocks and internal events. */
    title: text("title"),
    reason: text("reason"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("appointments_clinic_start_idx").on(table.clinicId, table.startsAt),
    index("appointments_patient_start_idx").on(table.patientId, table.startsAt),
    index("appointments_practitioner_start_idx").on(
      table.practitionerId,
      table.startsAt,
    ),
  ],
);

// ── Dental charts (odontogram) ─────────────────────────────────────────

export const dentalCharts = pgTable(
  "dental_charts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    notation: chartNotationEnum("notation").notNull().default("fdi"),
    chartedById: uuid("charted_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    /** Clinical summary for this snapshot (e.g. "full mouth series taken"). */
    notes: text("notes"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("dental_charts_patient_idx").on(table.patientId, table.recordedAt),
    index("dental_charts_clinic_idx").on(table.clinicId),
  ],
);

export const toothRecords = pgTable(
  "tooth_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    chartId: uuid("chart_id")
      .notNull()
      .references(() => dentalCharts.id, { onDelete: "cascade" }),
    /** Denormalised for fast "everything ever recorded on this patient" reads. */
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    /** FDI `11`–`48` (default) or Universal `1`–`32`. */
    tooth: varchar("tooth", { length: 3 }).notNull(),
    quadrant: smallint("quadrant"),
    condition: toothConditionEnum("condition").notNull(),
    /** Surfaces involved: M, O, D, B, L (lingual/palatal), I (incisal). */
    surfaces: varchar("surfaces", { length: 5 }).array().notNull().default([]),
    status: toothStatusEnum("status").notNull().default("existing"),
    treatmentTypeId: uuid("treatment_type_id").references(() => treatmentTypes.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    recordedById: uuid("recorded_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("tooth_records_patient_idx").on(table.patientId, table.tooth),
    index("tooth_records_chart_idx").on(table.chartId),
    uniqueIndex("tooth_records_unique_finding_idx").on(
      table.chartId,
      table.tooth,
      table.condition,
    ),
  ],
);

// ── Treatment planning & notes ─────────────────────────────────────────

export const treatmentPlanItems = pgTable(
  "treatment_plan_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    treatmentTypeId: uuid("treatment_type_id").references(() => treatmentTypes.id, {
      onDelete: "set null",
    }),
    toothRecordId: uuid("tooth_record_id").references(() => toothRecords.id, {
      onDelete: "set null",
    }),
    tooth: varchar("tooth", { length: 3 }),
    fee: numeric("fee", { precision: 12, scale: 2 }).notNull().default("0"),
    status: treatmentStatusEnum("status").notNull().default("planned"),
    sequence: integer("sequence").notNull().default(0),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("treatment_plan_patient_idx").on(table.patientId, table.sequence)],
);

export const clinicalNotes = pgTable(
  "clinical_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    appointmentId: uuid("appointment_id").references(() => appointments.id, {
      onDelete: "set null",
    }),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    notedAt: timestamp("noted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("clinical_notes_patient_idx").on(table.patientId, table.notedAt)],
);

// ── Inferred types ─────────────────────────────────────────────────────

export type Clinic = typeof clinics.$inferSelect;
export type User = typeof users.$inferSelect;
export type Operatory = typeof operatories.$inferSelect;
export type TreatmentType = typeof treatmentTypes.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type DentalChart = typeof dentalCharts.$inferSelect;
export type ToothRecord = typeof toothRecords.$inferSelect;
export type NewToothRecord = typeof toothRecords.$inferInsert;
export type TreatmentPlanItem = typeof treatmentPlanItems.$inferSelect;
export type ClinicalNote = typeof clinicalNotes.$inferSelect;

export type ToothCondition = (typeof toothConditionEnum.enumValues)[number];
export type ToothStatus = (typeof toothStatusEnum.enumValues)[number];
export type AppointmentStatus = (typeof appointmentStatusEnum.enumValues)[number];
export type AppointmentKind = (typeof appointmentKindEnum.enumValues)[number];
export type TreatmentStatus = (typeof treatmentStatusEnum.enumValues)[number];
