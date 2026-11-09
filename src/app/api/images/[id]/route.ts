import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { and, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { getDatabaseStatus, tryGetDb } from "@/db";
import { imageAccess, images } from "@/db/schema";
import { isStaff } from "@/lib/auth";
import { readCurrentUser } from "@/lib/session";

function storagePathForKey(key: string): string {
  const rel = key.replace(/^[/\\]+/, "");
  const bucket =
    process.env.IMAGE_STORAGE_PATH?.trim() || "./private/images";
  return `${bucket}/${rel}`;
}

function safeFileName(fileName: string): string {
  return fileName.replace(/[^\w.\- ]+/g, "_").slice(0, 120) || "image";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (getDatabaseStatus() !== "configured") {
    return NextResponse.json(
      { error: "The image store is not configured for this deployment." },
      { status: 503 },
    );
  }

  const db = tryGetDb();
  if (!db) {
    return NextResponse.json(
      { error: "The image store is not available." },
      { status: 503 },
    );
  }

  const user = await readCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const [image] = await db
      .select({
        id: images.id,
        clinicId: images.clinicId,
        patientId: images.patientId,
        fileKey: images.fileKey,
        fileName: images.fileName,
        mimeType: images.mimeType,
        checksum: images.checksum,
      })
      .from(images)
      .where(and(eq(images.id, id), eq(images.clinicId, user.clinicId)))
      .limit(1);

    // Scoped by clinic, so another practice's image id is indistinguishable
    // from a missing one.
    if (!image) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let allowed = isStaff(user.role);
    if (!allowed && user.role === "patient" && user.patientId === image.patientId) {
      // Patients only see images explicitly shared with them.
      const [row] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(imageAccess)
        .where(
          and(
            eq(imageAccess.patientId, user.patientId),
            eq(imageAccess.imageId, image.id),
          ),
        );
      allowed = Number(row?.n ?? 0) > 0;
    }

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const buffer = await readFile(storagePathForKey(image.fileKey));

      if (createHash("sha256").update(buffer).digest("hex") !== image.checksum) {
        console.error("image checksum mismatch", image.id);
        return NextResponse.json(
          { error: "Image integrity check failed" },
          { status: 503 },
        );
      }

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "content-type": image.mimeType,
          "content-disposition": `inline; filename="${safeFileName(image.fileName)}"`,
          "cache-control": "private, max-age=60, stale-while-revalidate=300",
          "content-length": String(buffer.length),
          "x-content-type-options": "nosniff",
          etag: `"${image.checksum}"`,
        },
      });
    } catch (error) {
      console.error("image read failed", image.id, error);
      return NextResponse.json(
        { error: "Image not available" },
        { status: 503 },
      );
    }
  } catch (error) {
    // A database outage is a controlled response here, never an unhandled 500.
    console.error("image lookup failed", error);
    return NextResponse.json(
      { error: "The image store is not available." },
      { status: 503 },
    );
  }
}
