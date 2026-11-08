"use client";

import { useActionState, useState } from "react";

import { initialActionState, recordToothConditionAction } from "@/app/actions";
import type { ToothCondition } from "@/db/schema";
import {
  FDI_LOWER_LEFT,
  FDI_LOWER_RIGHT,
  FDI_UPPER_LEFT,
  FDI_UPPER_RIGHT,
  SURFACES,
  SURFACE_LABELS,
  TOOTH_CONDITIONS,
  TOOTH_CONDITION_ORDER,
} from "@/lib/dental";
import { cn } from "@/lib/utils";

export type ChartFindingView = {
  id: string;
  tooth: string;
  condition: ToothCondition;
  surfaces: string[];
  status: string;
  notes: string | null;
  recordedAtLabel: string;
  recordedBy: string | null;
};

type Arch = "upper" | "lower";

function groupByTooth(findings: ChartFindingView[]) {
  const map = new Map<string, ChartFindingView[]>();
  for (const finding of findings) {
    const list = map.get(finding.tooth) ?? [];
    list.push(finding);
    map.set(finding.tooth, list);
  }
  return map;
}

function Tooth({
  tooth,
  arch,
  findings,
  selected,
  onSelect,
}: {
  tooth: string;
  arch: Arch;
  findings: ChartFindingView[];
  selected: boolean;
  onSelect: (tooth: string) => void;
}) {
  // Newest finding drives the colour; the rest are shown as a count.
  const primary = findings.at(-1);
  const meta = primary ? TOOTH_CONDITIONS[primary.condition] : null;
  const missing = findings.some((finding) => finding.condition === "missing");

  return (
    <button
      type="button"
      onClick={() => onSelect(tooth)}
      aria-pressed={selected}
      aria-label={`Tooth ${tooth}${meta ? `, ${meta.label}` : ", no findings"}`}
      className={cn(
        "relative flex h-12 w-7 shrink-0 items-center justify-center border transition-all",
        arch === "upper" ? "rounded-b-[9px] rounded-t-[3px]" : "rounded-b-[3px] rounded-t-[9px]",
        selected
          ? "outline-2 outline-offset-2 outline-forest"
          : "hover:outline-1 hover:outline-offset-1 hover:outline-forest/30",
        !meta && "border-line bg-cream-50 text-forest/45",
        missing && "border-dashed",
      )}
      style={
        meta
          ? {
              backgroundColor: `${meta.fill}1f`,
              borderColor: `${meta.fill}66`,
              color: meta.ink,
            }
          : undefined
      }
    >
      <span className={cn("text-[9.5px] font-medium tabular-nums", missing && "line-through")}>
        {tooth}
      </span>

      {meta ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 h-[3px]",
            arch === "upper" ? "bottom-0" : "top-0",
          )}
          style={{ backgroundColor: meta.fill }}
        />
      ) : null}

      {findings.length > 1 ? (
        <span
          aria-hidden="true"
          className="absolute top-0.5 right-0.5 text-[7px] font-semibold opacity-70"
        >
          {findings.length}
        </span>
      ) : null}
    </button>
  );
}

function Group({
  teeth,
  arch,
  findingsByTooth,
  selected,
  onSelect,
  label,
}: {
  teeth: readonly string[];
  arch: Arch;
  findingsByTooth: Map<string, ChartFindingView[]>;
  selected: string | null;
  onSelect: (tooth: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-muted/70">
        {label}
      </span>
      <div className="flex gap-0.5">
        {teeth.map((tooth) => (
          <Tooth
            key={tooth}
            tooth={tooth}
            arch={arch}
            findings={findingsByTooth.get(tooth) ?? []}
            selected={selected === tooth}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {TOOTH_CONDITION_ORDER.map((condition) => (
        <li key={condition} className="flex items-center gap-1.5 text-[10px] text-muted">
          <span
            aria-hidden="true"
            className="size-2 rounded-full"
            style={{ backgroundColor: TOOTH_CONDITIONS[condition].fill }}
          />
          {TOOTH_CONDITIONS[condition].label}
        </li>
      ))}
    </ul>
  );
}

const chipClass =
  "cursor-pointer rounded-full border border-line bg-cream-50 px-3 py-1.5 text-[11px] text-forest/70 transition-colors hover:border-forest/25";

function FindingForm({
  patientId,
  tooth,
  existing,
}: {
  patientId: string;
  tooth: string;
  existing: ChartFindingView[];
}) {
  const [state, formAction, pending] = useActionState(
    recordToothConditionAction,
    initialActionState,
  );

  return (
    <div className="rounded-xl border border-line bg-cream p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg text-forest">Tooth {tooth}</h3>
        <span className="text-[10px] uppercase tracking-[0.14em] text-muted">
          {existing.length === 0
            ? "No findings yet"
            : `${existing.length} finding${existing.length === 1 ? "" : "s"} on file`}
        </span>
      </div>

      {existing.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {existing.map((finding) => (
            <li
              key={finding.id}
              className="rounded-full border px-2.5 py-0.5 text-[10px]"
              style={{
                borderColor: `${TOOTH_CONDITIONS[finding.condition].fill}55`,
                backgroundColor: `${TOOTH_CONDITIONS[finding.condition].fill}14`,
                color: TOOTH_CONDITIONS[finding.condition].ink,
              }}
            >
              {TOOTH_CONDITIONS[finding.condition].label}
              {finding.surfaces.length > 0 ? ` · ${finding.surfaces.join("")}` : ""}
              {finding.status !== "existing" ? ` · ${finding.status}` : ""}
            </li>
          ))}
        </ul>
      ) : null}

      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="patientId" value={patientId} />
        <input type="hidden" name="tooth" value={tooth} />

        <fieldset>
          <legend className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">
            Finding
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {TOOTH_CONDITION_ORDER.map((condition, index) => (
              <label key={condition} className="relative">
                <input
                  type="radio"
                  name="condition"
                  value={condition}
                  defaultChecked={index === 0}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    chipClass,
                    "flex items-center gap-1.5 peer-checked:border-forest peer-checked:bg-forest peer-checked:text-cream peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-clay",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: TOOTH_CONDITIONS[condition].fill }}
                  />
                  {TOOTH_CONDITIONS[condition].short}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset>
            <legend className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">
              Surfaces
            </legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SURFACES.map((surface) => (
                <label key={surface} className="relative">
                  <input type="checkbox" name="surfaces" value={surface} className="peer sr-only" />
                  <span
                    title={SURFACE_LABELS[surface]}
                    className={cn(
                      chipClass,
                      "block px-2.5 peer-checked:border-forest peer-checked:bg-forest peer-checked:text-cream peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-clay",
                    )}
                  >
                    {surface}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="status"
              className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue="existing"
              className="mt-2 w-full rounded-xl border border-line bg-cream-50 px-3 py-2 text-[12px] text-forest focus:border-forest/40 focus:outline-none"
            >
              <option value="existing">Existing</option>
              <option value="planned">Planned</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="tooth-notes"
            className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted"
          >
            Note
          </label>
          <textarea
            id="tooth-notes"
            name="notes"
            rows={2}
            placeholder="Optional clinical note"
            className="mt-2 w-full rounded-xl border border-line bg-cream-50 px-3 py-2 text-[12px] text-forest placeholder:text-muted/50 focus:border-forest/40 focus:outline-none"
          />
        </div>

        {state.status !== "idle" ? (
          <p
            role="status"
            className={cn(
              "rounded-lg border px-3 py-2 text-[11px]",
              state.status === "success"
                ? "border-[#2F6F5E]/30 bg-[#2F6F5E]/8 text-[#245546]"
                : "border-[#8A4A4A]/30 bg-[#8A4A4A]/5 text-[#8A4A4A]",
            )}
          >
            {state.message}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-forest px-4 py-2 text-[11.5px] font-medium text-cream transition-colors hover:bg-forest-700 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Add to chart"}
          </button>
          <span className="text-[10px] text-muted">
            Findings are appended; existing records are kept.
          </span>
        </div>
      </form>
    </div>
  );
}

export function Odontogram({
  patientId,
  findings,
}: {
  patientId: string;
  findings: ChartFindingView[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const findingsByTooth = groupByTooth(findings);
  const selectedFindings = selected ? (findingsByTooth.get(selected) ?? []) : [];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-cream-50/80 p-4 sm:p-5">
        <div className="overflow-x-auto">
          <div className="mx-auto w-fit space-y-2">
            <div className="flex items-end justify-center gap-4">
              <Group
                teeth={FDI_UPPER_RIGHT}
                arch="upper"
                findingsByTooth={findingsByTooth}
                selected={selected}
                onSelect={setSelected}
                label="Upper right"
              />
              <span aria-hidden="true" className="mb-1 h-12 w-px bg-line" />
              <Group
                teeth={FDI_UPPER_LEFT}
                arch="upper"
                findingsByTooth={findingsByTooth}
                selected={selected}
                onSelect={setSelected}
                label="Upper left"
              />
            </div>

            <div className="rule-dotted h-px" aria-hidden="true" />

            <div className="flex items-start justify-center gap-4">
              <Group
                teeth={FDI_LOWER_RIGHT}
                arch="lower"
                findingsByTooth={findingsByTooth}
                selected={selected}
                onSelect={setSelected}
                label="Lower right"
              />
              <span aria-hidden="true" className="mt-6 h-12 w-px bg-line" />
              <Group
                teeth={FDI_LOWER_LEFT}
                arch="lower"
                findingsByTooth={findingsByTooth}
                selected={selected}
                onSelect={setSelected}
                label="Lower left"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-3.5">
          <Legend />
          <p className="text-[10px] text-muted/80">Select a tooth to record a finding</p>
        </div>
      </div>

      {selected ? (
        <FindingForm
          key={selected}
          patientId={patientId}
          tooth={selected}
          existing={selectedFindings}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-line px-4 py-6 text-center">
          <p className="text-[12px] text-muted">
            Tap a tooth above to inspect its history or record caries, a restoration,
            endodontic work, an implant or a missing tooth.
          </p>
        </div>
      )}
    </div>
  );
}
