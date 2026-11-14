/**
 * Creates (or repairs) the default clinic-owner account.
 *
 *   npm run db:create-admin
 *
 * Reads DATABASE_URL from `.env.local` first, then `.env`. Overridable:
 *
 *   ADMIN_EMAIL     default admin@nuv.com
 *   ADMIN_PASSWORD  default admin123
 *   ADMIN_NAME      default "Clinic Admin"
 *   ADMIN_CLINIC_SLUG  attach to this clinic instead of the oldest one
 *
 * Idempotent: an existing account with the same email gets its password,
 * role and active flag reset instead of failing on the unique index. If the
 * database has no clinic yet (schema pushed but never seeded) a minimal
 * practice row is created so the account has a tenant to belong to.
 */
import { config } from "dotenv";
import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { hashPassword } from "../src/lib/password";
import * as schema from "../src/db/schema";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "DATABASE_URL is missing. Add the pooled Postgres connection string to .env.local first.",
  );
  process.exit(1);
}

const EMAIL = (process.env.ADMIN_EMAIL ?? "admin@nuv.com").trim().toLowerCase();
const PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";
const FULL_NAME = process.env.ADMIN_NAME ?? "Clinic Admin";
const CLINIC_SLUG = process.env.ADMIN_CLINIC_SLUG?.trim() || null;

const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
const db = drizzle(client, { schema });

async function main() {
  const passwordHash = await hashPassword(PASSWORD);
  const now = new Date();

  let clinic = CLINIC_SLUG
    ? (await db.select().from(schema.clinics).where(eq(schema.clinics.slug, CLINIC_SLUG)).limit(1))[0]
    : (await db.select().from(schema.clinics).orderBy(asc(schema.clinics.createdAt)).limit(1))[0];

  if (!clinic) {
    if (CLINIC_SLUG) {
      console.error(`No clinic with slug "${CLINIC_SLUG}". Run npm run db:seed first.`);
      process.exit(1);
    }

    console.log("· no clinic in this database — creating a minimal practice row");
    const [created] = await db
      .insert(schema.clinics)
      .values({
        name: "NUV Clinic",
        slug: "nuv",
        timezone: "Asia/Gaza",
        currency: "ILS",
      })
      .returning();
    clinic = created;
  }

  const existing = (
    await db.select().from(schema.users).where(eq(schema.users.email, EMAIL)).limit(1)
  )[0];

  if (existing) {
    await db
      .update(schema.users)
      .set({
        clinicId: clinic.id,
        fullName: FULL_NAME,
        role: "owner",
        passwordHash,
        isActive: true,
        emailVerifiedAt: existing.emailVerifiedAt ?? now,
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: now,
      })
      .where(eq(schema.users.id, existing.id));

    console.log(`✓ Updated existing account ${EMAIL} (owner) in clinic ${clinic.slug}`);
  } else {
    await db.insert(schema.users).values({
      clinicId: clinic.id,
      fullName: FULL_NAME,
      email: EMAIL,
      role: "owner",
      passwordHash,
      emailVerifiedAt: now,
    });

    console.log(`✓ Created account ${EMAIL} (owner) in clinic ${clinic.slug}`);
  }

  console.log(`  Sign in at /login → /clinic with the password you configured.`);
  if (PASSWORD === "admin123") {
    console.log("  ⚠️  Using the default password — change it before this database is public.");
  }

  await client.end();
  process.exit(0);
}

main().catch(async (error) => {
  console.error("create-admin failed:", error);
  await client.end({ timeout: 1 }).catch(() => {});
  process.exit(1);
});
