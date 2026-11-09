import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PatientHeader } from "@/components/clinic/patient-header";
import {
  DbNotice,
  EmptyState,
  ListSkeleton,
  Panel,
  Skeleton,
} from "@/components/clinic/ui";
import { ChevronLeft, ImageIcon } from "@/components/icons";
import {
  getClinic,
  getPatient,
  getPatientChart,
  getPatientImages,
  getPatientPlan,
  type PatientImage,
} from "@/db/queries";
import { load } from "@/db/safe";
import { requireStaffUser } from "@/lib/auth";
import { imagingCategoryLabel } from "@/lib/imaging";
import { formatDate } from "@/lib/utils";

import { UploadImageForm } from "./UploadImageForm";

export const metadata = {
  title: "Medical imaging",
};

export default async function ImagingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireStaffUser();
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Link
        href={`/clinic/patients/${id}`}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted transition-colors hover:text-forest"
      >
        <ChevronLeft className="size-3.5" /> Back to patient
      </Link>

      <Suspense fallback={<ImagingSkeleton />}>
        <ImagingContent patientId={id} viewerRole={user.role} />
      </Suspense>
    </div>
  );
}

async function ImagingContent({
  patientId,
  viewerRole,
}: {
  patientId: string;
  viewerRole: string;
}) {
  const result = await load(
    async () => {
      const clinic = await getClinic();
      if (!clinic) return { kind: "no-clinic" } as const;

      const patient = await getPatient(clinic.id, patientId);
      if (!patient) return { kind: "missing" } as const;

      const [chart, plan, images] = await Promise.all([
        getPatientChart(patient.id),
        getPatientPlan(patient.id),
        getPatientImages(clinic.id, patient.id, {
          role: viewerRole,
          patientId: null,
        }),
      ]);

      return { kind: "ok" as const, clinic, patient, chart, plan, images };
    },
  );

  if (!result.ok) return <DbNotice error={result.error} />;

  if (result.data.kind === "no-clinic") {
    return (
      <EmptyState
        title="No clinic yet"
        body="Seed the practice before opening patient records."
        action={{ label: "Back to patients", href: "/clinic/patients" }}
      />
    );
  }

  if (result.data.kind === "missing") notFound();

  const { clinic, patient, chart, plan, images } = result.data;

  return (
    <>
      <PatientHeader
        patient={patient}
        clinicName={clinic.name}
        timeZone={clinic.timezone}
        active="imaging"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Panel
          title="Attach an image"
          description="X-rays, intraoral photos and lab documents live with the patient record."
        >
          <UploadImageForm
            patientId={patient.id}
            chartId={chart.chartId}
            planItems={plan.map((item) => ({
              id: item.id,
              tooth: item.tooth,
              treatmentName: item.treatmentName,
            }))}
          />
        </Panel>

        <Panel
          title="Imaging library"
          description={`${images.length} image${images.length === 1 ? "" : "s"} on file`}
        >
          {images.length === 0 ? (
            <p className="py-2 text-[12px] leading-relaxed text-muted">
              No X-rays or clinical images recorded yet. Attach the first one with
              the form beside this panel.
            </p>
          ) : (
            <ul className="space-y-3">
              {images.map((image) => (
                <ImageCard key={image.id} image={image} timeZone={clinic.timezone} />
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}

function ImageCard({ image, timeZone }: { image: PatientImage; timeZone: string }) {
  return (
    <li className="overflow-hidden rounded-xl border border-line/80">
      <div className="flex gap-3 p-3">
        <a
          href={`/api/images/${image.id}`}
          target="_blank"
          rel="noreferrer"
          className="block size-20 shrink-0 overflow-hidden rounded-lg border border-line/70 bg-cream-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/images/${image.id}`}
            alt={image.description ?? imagingCategoryLabel(image.category)}
            className="size-full object-cover"
            loading="lazy"
          />
        </a>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[12.5px] font-medium text-forest">
              {imagingCategoryLabel(image.category)}
            </p>
            {image.tooth ? (
              <span className="rounded-full border border-forest/20 bg-forest/5 px-2 py-0.5 text-[10px] font-medium text-forest/70">
                Tooth {image.tooth}
              </span>
            ) : null}
          </div>
          {image.description ? (
            <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-muted">
              {image.description}
            </p>
          ) : null}
          <p className="mt-1.5 truncate text-[10.5px] text-muted/80">
            {formatDate(image.uploadedAt, timeZone, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {image.uploadedByName ? ` · ${image.uploadedByName}` : ""}
            {` · ${(image.sizeBytes / 1024 / 1024).toFixed(1)} MB`}
          </p>
        </div>

        <a
          href={`/api/images/${image.id}`}
          target="_blank"
          rel="noreferrer"
          className="self-center rounded-full border border-forest/20 px-3 py-1.5 text-[10.5px] font-medium text-forest transition-colors hover:border-forest/40"
        >
          Open
        </a>
      </div>
    </li>
  );
}

function ImagingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-72 rounded-2xl" />
      <ListSkeleton rows={3} />
      <div className="flex items-center gap-2 text-[12px] text-muted">
        <ImageIcon className="size-4" /> Loading imaging library…
      </div>
    </div>
  );
}
