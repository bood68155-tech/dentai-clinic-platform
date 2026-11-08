import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js reads `.env.local`; drizzle-kit only knows `process.env`.
config({ path: ".env.local", quiet: true });
config({ quiet: true });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});
