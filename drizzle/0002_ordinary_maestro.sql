CREATE TYPE "public"."financial_category" AS ENUM('adjustment', 'appointment_fee', 'insurance_payment', 'payment', 'refund', 'supply', 'lab', 'write_off');--> statement-breakpoint
CREATE TYPE "public"."financial_memo_type" AS ENUM('check', 'card', 'cash', 'transfer', 'insurance', 'note');--> statement-breakpoint
CREATE TYPE "public"."imaging_category" AS ENUM('panoramic', 'periapical', 'bitewing', 'occlusal', 'cbct', 'extraoral', 'intraoral', 'photo', 'lab', 'document');--> statement-breakpoint
CREATE TABLE "financial_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid,
	"appointment_id" uuid,
	"treatment_plan_item_id" uuid,
	"category" "financial_category" NOT NULL,
	"memo_type" "financial_memo_type",
	"amount" numeric(12, 2) NOT NULL,
	"reference" text,
	"notes" text,
	"entered_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "image_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"image_id" uuid NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"category" "imaging_category" NOT NULL,
	"file_key" text NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"checksum" text NOT NULL,
	"tooth" varchar(3),
	"chart_id" uuid,
	"treatment_plan_item_id" uuid,
	"appointment_id" uuid,
	"description" text,
	"uploaded_by_id" uuid,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"used" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "financial_events" ADD CONSTRAINT "financial_events_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_events" ADD CONSTRAINT "financial_events_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_events" ADD CONSTRAINT "financial_events_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_events" ADD CONSTRAINT "financial_events_treatment_plan_item_id_treatment_plan_items_id_fk" FOREIGN KEY ("treatment_plan_item_id") REFERENCES "public"."treatment_plan_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_events" ADD CONSTRAINT "financial_events_entered_by_id_users_id_fk" FOREIGN KEY ("entered_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_access" ADD CONSTRAINT "image_access_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_access" ADD CONSTRAINT "image_access_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_chart_id_dental_charts_id_fk" FOREIGN KEY ("chart_id") REFERENCES "public"."dental_charts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_treatment_plan_item_id_treatment_plan_items_id_fk" FOREIGN KEY ("treatment_plan_item_id") REFERENCES "public"."treatment_plan_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "financial_events_clinic_date_idx" ON "financial_events" USING btree ("clinic_id","created_at");--> statement-breakpoint
CREATE INDEX "financial_events_patient_idx" ON "financial_events" USING btree ("patient_id","created_at");--> statement-breakpoint
CREATE INDEX "financial_events_appointment_idx" ON "financial_events" USING btree ("appointment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "image_access_patient_image_idx" ON "image_access" USING btree ("patient_id","image_id");--> statement-breakpoint
CREATE INDEX "image_access_patient_idx" ON "image_access" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "images_patient_idx" ON "images" USING btree ("patient_id","uploaded_at");--> statement-breakpoint
CREATE INDEX "images_clinic_idx" ON "images" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "images_chart_idx" ON "images" USING btree ("chart_id");--> statement-breakpoint
CREATE INDEX "images_plan_item_idx" ON "images" USING btree ("treatment_plan_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "password_resets_id_idx" ON "password_resets" USING btree ("id");