"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { uploadImageAction } from "@/app/actions";
import { ImageIcon as Upload } from "@/components/icons";
import { initialImageUploadState } from "@/lib/form-state";
import { IMAGING_CATEGORIES, IMAGING_CATEGORY_LABELS } from "@/lib/imaging";

const inputClass =
  "w-full rounded-xl border border-line bg-cream-50 px-3.5 py-2.5 text-[13px] text-forest placeholder:text-muted/50 transition-colors focus:border-forest/40 focus:outline-none";

function Field({
  label,
  name,
  hint,
  children,
  className,
}: {
  label: string;
  name: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted"
      >
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1.5 text-[10.5px] text-muted/70">{hint}</p> : null}
    </div>
  );
}

export function UploadImageForm({
  patientId,
  chartId,
  planItems,
}: {
  patientId: string;
  chartId: string | null;
  planItems: { id: string; tooth: string | null; treatmentName: string | null }[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    uploadImageAction,
    initialImageUploadState,
  );

  useEffect(() => {
    if (state.status !== "success") return;
    // The action only returns success after the row is written, so refresh the
    // server component to reveal the new image in the gallery.
    formRef.current?.reset();
    router.refresh();
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="patientId" value={patientId} />

      <Field label="Image file" name="file" hint="PNG or JPEG, up to 8 MB.">
        <input
          id="file"
          name="file"
          type="file"
          accept="image/png,image/jpeg"
          required
          className="block w-full cursor-pointer rounded-xl border border-line bg-cream-50 px-3.5 py-2.5 text-[12.5px] text-forest file:mr-3 file:rounded-full file:border-0 file:bg-forest file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-cream hover:file:bg-forest-700"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" name="category">
          <select id="category" name="category" className={inputClass} defaultValue="periapical">
            {IMAGING_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {IMAGING_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tooth (optional)" name="tooth" hint="FDI notation, e.g. 11 or 46.">
          <input
            id="tooth"
            name="tooth"
            inputMode="numeric"
            maxLength={2}
            pattern="\d{1,2}"
            placeholder="11"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Description (optional)" name="description">
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={1000}
          placeholder="Main complaint, landmark, or follow-up note."
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Link to chart (optional)" name="chartId">
          <select id="chartId" name="chartId" className={inputClass} defaultValue="">
            <option value="">— none —</option>
            {chartId ? <option value={chartId}>Current chart snapshot</option> : null}
          </select>
        </Field>
        <Field label="Link to treatment (optional)" name="planItemId">
          <select id="planItemId" name="planItemId" className={inputClass} defaultValue="">
            <option value="">— none —</option>
            {planItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.treatmentName ?? "Treatment"}
                {item.tooth ? ` · tooth ${item.tooth}` : ""}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-xl border border-[#8A4A4A]/30 bg-[#8A4A4A]/5 px-4 py-3 text-[12px] text-[#8A4A4A]"
        >
          {state.message}
        </p>
      ) : null}

      {state.status === "success" ? (
        <p
          role="status"
          className="rounded-xl border border-forest/20 bg-forest/5 px-4 py-3 text-[12px] text-forest"
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-block"
      >
        <Upload className="size-4" />
        {pending ? "Uploading…" : "Attach image"}
      </button>
    </form>
  );
}
