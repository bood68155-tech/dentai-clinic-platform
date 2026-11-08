import { connection } from "next/server";
import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "@/db";

export async function GET() {
  // Render per request so the check reflects the running deployment.
  await connection();

  return NextResponse.json({
    status: "ok",
    service: "dentai-clinic-platform",
    database: isDatabaseConfigured() ? "configured" : "missing",
    timestamp: new Date().toISOString(),
  });
}
