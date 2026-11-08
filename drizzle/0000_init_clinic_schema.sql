CREATE TYPE "public"."appointment_kind" AS ENUM('treatment', 'consultation', 'hygiene', 'break', 'lunch', 'block');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'confirmed', 'arrived', 'in_chair', 'completed', 'no_show', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."chart_notation" AS ENUM('fdi', 'universal');--> statement-breakpoint
CREATE TYPE "public"."tooth_condition" AS ENUM('caries', 'restoration', 'crown', 'bridge', 'implant', 'endo', 'fracture', 'sealant', 'missing');--> statement-breakpoint
CREATE TYPE "public"."tooth_status" AS ENUM('existing', 'planned', 'completed');--> statement-breakpoint
CREATE TYPE "public"."treatment_status" AS ENUM('planned', 'accepted', 'completed', 'declined');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'dentist', 'hygienist', 'assistant', 'receptionist');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid,
	"practitioner_id" uuid,
	"operatory_id" uuid,
	"treatment_type_id" uuid,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" "appointment_status" DEFAULT 'scheduled' NOT NULL,
	"kind" "appointment_kind" DEFAULT 'treatment' NOT NULL,
	"title" text,
	"reason" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinical_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid,
	"author_id" uuid,
	"body" text NOT NULL,
	"noted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(64) NOT NULL,
	"phone" text,
	"email" text,
	"address" text,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"working_hours" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dental_charts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"notation" chart_notation DEFAULT 'fdi' NOT NULL,
	"charted_by_id" uuid,
	"notes" text,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operatories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" varchar(7) DEFAULT '#A8B5A2' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"date_of_birth" date,
	"gender" text,
	"email" text,
	"phone" text,
	"address" text,
	"occupation" text,
	"medical_alerts" text[] DEFAULT '{}' NOT NULL,
	"allergies" text,
	"medical_notes" text,
	"notes" text,
	"referral_source" text,
	"insurance_carrier" text,
	"insurance_member_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tooth_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chart_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"tooth" varchar(3) NOT NULL,
	"quadrant" smallint,
	"condition" "tooth_condition" NOT NULL,
	"surfaces" varchar(5)[] DEFAULT '{}' NOT NULL,
	"status" "tooth_status" DEFAULT 'existing' NOT NULL,
	"treatment_type_id" uuid,
	"notes" text,
	"recorded_by_id" uuid,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treatment_plan_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"treatment_type_id" uuid,
	"tooth_record_id" uuid,
	"tooth" varchar(3),
	"fee" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" "treatment_status" DEFAULT 'planned' NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treatment_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"code" varchar(16) NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"duration_minutes" integer DEFAULT 30 NOT NULL,
	"default_fee" numeric(12, 2) DEFAULT '0' NOT NULL,
	"color" varchar(7) DEFAULT '#A8B5A2' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'dentist' NOT NULL,
	"specialty" text,
	"license_number" text,
	"color" varchar(7) DEFAULT '#16332A' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_practitioner_id_users_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_operatory_id_operatories_id_fk" FOREIGN KEY ("operatory_id") REFERENCES "public"."operatories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_treatment_type_id_treatment_types_id_fk" FOREIGN KEY ("treatment_type_id") REFERENCES "public"."treatment_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dental_charts" ADD CONSTRAINT "dental_charts_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dental_charts" ADD CONSTRAINT "dental_charts_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dental_charts" ADD CONSTRAINT "dental_charts_charted_by_id_users_id_fk" FOREIGN KEY ("charted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operatories" ADD CONSTRAINT "operatories_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tooth_records" ADD CONSTRAINT "tooth_records_chart_id_dental_charts_id_fk" FOREIGN KEY ("chart_id") REFERENCES "public"."dental_charts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tooth_records" ADD CONSTRAINT "tooth_records_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tooth_records" ADD CONSTRAINT "tooth_records_treatment_type_id_treatment_types_id_fk" FOREIGN KEY ("treatment_type_id") REFERENCES "public"."treatment_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tooth_records" ADD CONSTRAINT "tooth_records_recorded_by_id_users_id_fk" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plan_items" ADD CONSTRAINT "treatment_plan_items_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plan_items" ADD CONSTRAINT "treatment_plan_items_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plan_items" ADD CONSTRAINT "treatment_plan_items_treatment_type_id_treatment_types_id_fk" FOREIGN KEY ("treatment_type_id") REFERENCES "public"."treatment_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plan_items" ADD CONSTRAINT "treatment_plan_items_tooth_record_id_tooth_records_id_fk" FOREIGN KEY ("tooth_record_id") REFERENCES "public"."tooth_records"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_types" ADD CONSTRAINT "treatment_types_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_clinic_start_idx" ON "appointments" USING btree ("clinic_id","starts_at");--> statement-breakpoint
CREATE INDEX "appointments_patient_start_idx" ON "appointments" USING btree ("patient_id","starts_at");--> statement-breakpoint
CREATE INDEX "appointments_practitioner_start_idx" ON "appointments" USING btree ("practitioner_id","starts_at");--> statement-breakpoint
CREATE INDEX "clinical_notes_patient_idx" ON "clinical_notes" USING btree ("patient_id","noted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "clinics_slug_idx" ON "clinics" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "dental_charts_patient_idx" ON "dental_charts" USING btree ("patient_id","recorded_at");--> statement-breakpoint
CREATE INDEX "dental_charts_clinic_idx" ON "dental_charts" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "operatories_clinic_idx" ON "operatories" USING btree ("clinic_id","sort_order");--> statement-breakpoint
CREATE INDEX "patients_clinic_name_idx" ON "patients" USING btree ("clinic_id","last_name","first_name");--> statement-breakpoint
CREATE INDEX "patients_clinic_phone_idx" ON "patients" USING btree ("clinic_id","phone");--> statement-breakpoint
CREATE INDEX "tooth_records_patient_idx" ON "tooth_records" USING btree ("patient_id","tooth");--> statement-breakpoint
CREATE INDEX "tooth_records_chart_idx" ON "tooth_records" USING btree ("chart_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tooth_records_unique_finding_idx" ON "tooth_records" USING btree ("chart_id","tooth","condition");--> statement-breakpoint
CREATE INDEX "treatment_plan_patient_idx" ON "treatment_plan_items" USING btree ("patient_id","sequence");--> statement-breakpoint
CREATE UNIQUE INDEX "treatment_types_clinic_code_idx" ON "treatment_types" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_clinic_idx" ON "users" USING btree ("clinic_id");