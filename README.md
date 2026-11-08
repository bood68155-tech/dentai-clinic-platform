# Dentai — smart dental clinic platform

A dental practice platform with two faces: a calm, editorial **public site** for the
clinic, and a **clinical workspace** for patients, appointments and dental charts.
Both are behind a self-hosted, role-based sign-in: patients get their own
dashboard, while doctors and the clinic team work inside `/clinic`.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Drizzle ORM and
Postgres — designed to deploy to Vercel with a serverless-friendly database.

- **Public site** — hero, treatments, approach, visiting details, online booking.
- **Clinic platform** — overview, patient records, appointment agenda, per-patient
  odontogram.

---

## Stack

| Layer      | Choice                                                             |
| ---------- | ------------------------------------------------------------------ |
| Framework  | Next.js 16.4 (App Router, Turbopack, Cache Components / PPR)        |
| Language   | TypeScript (strict)                                                 |
| Styling    | Tailwind CSS v4 with a custom design-token theme                    |
| Type       | Newsreader (display) + Manrope (UI), via `next/font`                |
| Data       | Drizzle ORM + `postgres.js` against any Postgres                    |
| Deployment | Vercel; Neon (or any managed Postgres) for the database             |

## Design direction

The visual language follows the **General Dental** reference: warm cream paper,
deep forest ink, a clay accent, large display type with italic emphasis, generous
whitespace and hairline rules instead of heavy cards. No stock photography — the
hero uses an abstract composition and a **live availability card** pulled from the
practice calendar.

## Quick start

```bash
git clone https://github.com/bood68155-tech/dentai-clinic-platform
cd dentai-clinic-platform
npm install

cp .env.example .env.local        # paste your Postgres connection string

npm run db:push                   # create the tables from src/db/schema.ts
npm run db:seed                   # demo clinic: 4 clinicians, 6 patients, charts
npm run dev                       # http://localhost:3000
```

Without `DATABASE_URL` the app still boots: the public site renders, and the
clinical screens show a "database not connected" panel with the setup steps
instead of crashing.

## Routes

| Route                              | What it is                                                     |
| ---------------------------------- | -------------------------------------------------------------- |
| `/`                                | Marketing site with live next-available slot                    |
| `/book`                            | Booking request form → writes a patient + appointment           |
| `/clinic`                          | Practice overview: stats, today's book, recent records          |
| `/clinic/patients`                 | Searchable patient list (name, phone, email)                    |
| `/clinic/patients/new`             | Create a patient record                                         |
| `/clinic/patients/[id]`            | Contact, medical file, treatment plan, clinical notes            |
| `/clinic/patients/[id]/chart`      | Interactive FDI odontogram + chart history                      |
| `/clinic/appointments`             | Day agenda with date navigation (`?date=YYYY-MM-DD`)            |
| `/login`                           | Sign in (all roles) — redirects to the role's home               |
| `/register`                        | Patient self-registration (links to an existing record by email) |
| `/account`                         | Patient dashboard: visits, treatment plan, record summary        |
| `/api/health`                      | Liveness + whether the database is configured                   |

## Data model

`src/db/schema.ts` is the single source of truth; `drizzle/` holds the generated SQL.

| Table                  | Purpose                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `clinics`              | Practice profile, timezone, currency, working hours (JSONB)      |
| `users`                | Clinicians, front desk and patients, with roles and agenda colours |
| `sessions`             | Opaque sign-in sessions (token hashes, expiry, revocation)       |
| `operatories`          | Treatment rooms / chairs                                         |
| `treatment_types`      | Procedure catalogue: code, duration, fee, colour                 |
| `patients`             | Demographics, contact, medical alerts (text[]), insurance        |
| `appointments`         | Booked slots with status, kind and clinical reason               |
| `dental_charts`        | One charted snapshot of a patient's mouth                        |
| `tooth_records`        | Individual findings: tooth, condition, surfaces, status          |
| `treatment_plan_items` | Sequenced plan with fees and acceptance status                    |
| `clinical_notes`       | Timestamped notes attributed to a clinician                      |

### Dental chart design

- Charts are **versioned**: a `dental_charts` row is a snapshot, and `tooth_records`
  are the findings inside it, so the record keeps its clinical history.
- Findings are **appended, never overwritten**. Re-recording the same condition on
  the same tooth updates that finding (unique on `chart_id + tooth + condition`)
  and refreshes its timestamp.
- Teeth use **FDI** two-digit notation by default (`18`–`48`); `chart_notation`
  allows Universal numbering per chart.
- Conditions: caries, restoration, crown, bridge, implant, endodontic, fracture,
  sealant, missing — each with its own colour in the odontogram and legend.
- Surfaces are stored per finding (`M`, `O`, `D`, `B`, `L`).

### Booking flow

`/book` posts to a server action that calls `requestAppointment`
(`src/db/mutations.ts`):

1. validates the request and converts clinic wall-clock time → UTC,
2. reuses an existing patient matched by email or phone, otherwise creates one,
3. inserts a `consultation` appointment so it appears in the clinic agenda,
4. shows a confirmation with the requested slot.

Live availability on the landing page comes from `getNextOpening()`, which walks the
practice opening hours for the next ten days and skips slots that clash with the book.

## Authentication & roles

Sign-in is self-hosted — no third-party auth provider, so credentials never leave
the practice's own database. Passwords are hashed with Node's built-in **scrypt**
(memory-hard), and sessions are opaque, database-backed tokens: the browser only
holds a 32-byte token, the database stores its SHA-256 hash, so a leaked row
cannot be replayed. Cookies are `httpOnly`, `SameSite=Lax`, `Secure` in
production, and expire after 30 days with sliding renewal.

| Role                                       | Can reach                                                    | Sees                              |
| ------------------------------------------ | ------------------------------------------------------------ | --------------------------------- |
| `patient`                                  | `/account`, `/book`                                          | own visits, plan, chart summary   |
| `owner`, `dentist`, `hygienist`, `assistant`, `receptionist` | `/clinic` and everything under it | full practice data                |

Guards live in `src/lib/auth.ts` (`requireStaffUser`, `requirePatientUser`,
`requireOwnerUser`). The clinic layout and the patient layout enforce them at the
route boundary, and the mutating server actions check the session again — so a
deep link or a stray form post can never bypass the role check.

Sign-in security details:

- Five failed attempts lock an account for 15 minutes.
- Unknown emails burn the same scrypt work as real ones, and every failure
  returns the same message, so accounts cannot be enumerated.
- Patient registration links to an existing patient record when the same email
  already exists on exactly one record (for example from an online booking).
- Staff accounts are provisioned by the clinic (seed script or a future admin
  screen); only patients can self-register.

### Demo accounts (after `npm run db:seed`)

| Email                                | Password       | Role     | Lands on  |
| ------------------------------------ | -------------- | -------- | --------- |
| `maya.haddad@dentaiclinic.com`       | `DentaiDemo-2026` | owner | `/clinic` |
| `elias.rahal@dentaiclinic.com`       | `DentaiDemo-2026` | dentist | `/clinic` |
| `amelia.fontaine@example.com`        | `DentaiDemo-2026` | patient | `/account` |

⚠️ Demo credentials only — change them and never seed demo data into a real
deployment.

## Scripts

| Script               | What it does                                         |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Development server (Turbopack)                       |
| `npm run build`      | Production build                                     |
| `npm run start`      | Serve the production build                           |
| `npm run lint`       | ESLint                                               |
| `npm run typecheck`  | `tsc --noEmit`                                       |
| `npm run db:generate`| Generate SQL from schema changes                     |
| `npm run db:push`    | Push the schema straight to the database             |
| `npm run db:migrate` | Apply the committed migrations in `drizzle/`         |
| `npm run db:seed`    | (Re)create the demo clinic — idempotent, demo only   |
| `npm run db:studio`  | Drizzle Studio                                       |

## Deploying to Vercel

1. **Create the database.** In [Neon](https://console.neon.tech) create a project and
   copy the **pooled** connection string. Any Postgres works, including Vercel
   Postgres, Supabase or RDS.
2. **Import the repo** into Vercel. The default Next.js preset needs no extra config.
3. **Set `DATABASE_URL`** in Project → Settings → Environment Variables for
   Production, Preview and Development. `.env.local` is git-ignored, so never commit it.
4. **Create the tables** once, pointing at the deployed database:
   ```bash
   DATABASE_URL="postgresql://…" npm run db:migrate
   DATABASE_URL="postgresql://…" npm run db:seed   # optional demo data
   ```
5. **Deploy**, then check `https://<your-app>/api/health` — it should report
   `"database": "configured"`.

The driver uses `max: 1` and `prepare: false`, which keeps serverless functions safe
behind transaction-mode poolers.

## Project structure

```
src/
  app/
    page.tsx              marketing landing page
    book/                 public booking page + server action
    clinic/               clinical workspace (overview, patients, agenda)
    api/health/           health check
    actions.ts            clinic server actions (patient + tooth findings)
  components/
    marketing/            hero, services, approach, visit, availability, booking form
    clinic/               sidebar, agenda, odontogram, patient form, UI primitives
    site-header.tsx       marketing chrome
    site-footer.tsx
  db/
    schema.ts             Drizzle schema (tables, enums, indexes)
    queries.ts            typed reads used by server components
    mutations.ts          booking write path
    index.ts              lazily created postgres.js/Drizzle client
    safe.ts               error-tolerant read wrapper for fresh deployments
  lib/
    dental.ts             FDI teeth, conditions, surface reference data
    time.ts               timezone helpers (wall-clock ↔ UTC)
    clinic-profile.ts     public practice details
scripts/seed.ts           demo data
drizzle/                  generated SQL migrations
```

## References

The domain modelling is based on two open-source projects:

- [clawnify/OpenDentist](https://github.com/clawnify/OpenDentist) — multi-operatory
  day agenda, FDI odontogram and treatment-planning concepts (MIT).
- [Ahmad-Tayh2/smiluster](https://github.com/Ahmad-Tayh2/smiluster) — clinic-scoped
  records, act catalogue and tooth↔act↔appointment relationships (MIT).

No code was copied; the schema and UI here are an independent Next.js/Postgres
implementation of those ideas.

## Roadmap

Natural next steps, all backed by the existing schema:

- Email verification, password reset and magic-link sign-in.
- Admin screens for provisioning staff accounts and linking patient records.
- Appointment creation, drag-to-reschedule and recall reminders.
- Invoices and payments, linked to `treatment_plan_items`.
- Lab cases, insurance plans and document uploads.
- Audit logging for clinical edits.
