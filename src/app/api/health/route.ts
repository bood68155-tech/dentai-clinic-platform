import { connection } from "next/server";
import { NextResponse } from "next/server";

import { getDatabaseStatus } from "@/db";

export async function GET() {
  // Render per request so the check reflects the running deployment.
  await connection();

  return NextResponse.json({
    status: "ok",
    service: "nuv-clinic-platform",
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
  });
}
