import "server-only";

import { and, asc, count, desc, eq, gte, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import { cache } from "react";

import { getDb } from "./index";
import {
  appointments,
  clinicalNotes,
  clinics,
  dentalCharts,
  operatories,
  patients,
  toothRecords,
  treatmentPlanItems,
  treatmentTypes,
  users,
  type Clinic,
  type Patient,
  type ToothCondition,
  type User,
} from "./schema";
import {
  DEFAULT_CONSULT_MINUTES,
  OPENING_HOURS,
  shiftDay,
  todayIn,
  weekdayIndex,
  zonedDateTime,
} from "../lib/time";

/**
 * Reads used by the clinic dashboard.
 *
 * Each function is wrapped in React's `cache()` so a page that needs the clinic
 * plus a patient plus an agenda only issues one query per table per request.
 */

export const getClinic = cache(async (): Promise<Clinic | null> => {
  const db = getDb();
  const [clinic] = await db.select().from(clinics).orderBy(asc(clinics.createdAt)).limit(1);
  return clinic ?? null;
});

export type AgendaItem = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  kind: string;
  title: string | null;
  reason: string | null;
  patientId: string | null;
  patientFirstName: string | null;
  patientLastName: string | null;
  practitionerName: string | null;
  practitionerColor: string | null;
  operatoryName: string | null;
  treatmentName: string | null;
  treatmentColor: string | null;
};

function agendaColumns() {
  return {
    id: appointments.id,
    startsAt: appointments.startsAt,
    endsAt: appointments.endsAt,
    status: appointments.status,
    kind: appointments.kind,
    title: appointments.title,
    reason: appointments.reason,
    patientId: appointments.patientId,
    patientFirstName: patients.firstName,
    patientLastName: patients.lastName,
    practitionerName: users.fullName,
    practitionerColor: users.color,
    operatoryName: operatories.name,
    treatmentName: treatmentTypes.name,
    treatmentColor: treatmentTypes.color,
  };
}

export const getAgenda = cache(
  async (clinicId: string, day: string, timeZone: string): Promise<AgendaItem[]> => {
    const db = getDb();
    return db
      .select(agendaColumns())
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(users, eq(appointments.practitionerId, users.id))
      .leftJoin(operatories, eq(appointments.operatoryId, operatories.id))
      .leftJoin(treatmentTypes, eq(appointments.treatmentTypeId, treatmentTypes.id))
      .where(
        and(
          eq(appointments.clinicId, clinicId),
          sql`(${appointments.startsAt} AT TIME ZONE ${timeZone})::date = ${day}::date`,
        ),
      )
      .orderBy(asc(appointments.startsAt));
  },
);

export type PatientRow = Patient & {
  lastVisitAt: Date | null;
  openPlanItems: number;
};

export const listPatients = cache(
  async (clinicId: string, search?: string): Promise<PatientRow[]> => {
    const db = getDb();
    const term = search?.trim();
    const filter = term
      ? or(
          ilike(patients.firstName, `%${term}%`),
          ilike(patients.lastName, `%${term}%`),
          ilike(patients.phone, `%${term}%`),
          ilike(patients.email, `%${term}%`),
        )
      : undefined;

    const rows = await db
      .select({
        patient: patients,
        lastVisitAt: sql<Date | null>`(
          select max(${appointments.startsAt})
          from ${appointments}
          where ${appointments.patientId} = ${patients.id}
            and ${appointments.status} in ('completed', 'arrived', 'in_chair')
        )`,
        openPlanItems: sql<number>`(
          select count(*)::int
          from ${treatmentPlanItems}
          where ${treatmentPlanItems.patientId} = ${patients.id}
            and ${treatmentPlanItems.status} in ('planned', 'accepted')
        )`,
      })
      .from(patients)
      .where(and(eq(patients.clinicId, clinicId), filter))
      .orderBy(asc(patients.lastName), asc(patients.firstName));

    return rows.map((row) => ({
      ...row.patient,
      lastVisitAt: row.lastVisitAt ? new Date(row.lastVisitAt) : null,
      openPlanItems: Number(row.openPlanItems ?? 0),
    }));
  },
);

export const getPatient = cache(
  async (clinicId: string, patientId: string): Promise<Patient | null> => {
    const db = getDb();
    const [patient] = await db
      .select()
      .from(patients)
      .where(and(eq(patients.clinicId, clinicId), eq(patients.id, patientId)))
      .limit(1);
    return patient ?? null;
  },
);

export type ChartFinding = {
  id: string;
  tooth: string;
  condition: ToothCondition;
  surfaces: string[];
  status: string;
  notes: string | null;
  recordedAt: Date;
  recordedBy: string | null;
};

export type PatientChart = {
  chartId: string | null;
  recordedAt: Date | null;
  notation: "fdi" | "universal";
  findings: ChartFinding[];
  byCondition: Record<string, number>;
};

export const getPatientChart = cache(
  async (patientId: string): Promise<PatientChart> => {
    const db = getDb();
    const [chart] = await db
      .select()
      .from(dentalCharts)
      .where(eq(dentalCharts.patientId, patientId))
      .orderBy(desc(dentalCharts.recordedAt))
      .limit(1);

    if (!chart) {
      return {
        chartId: null,
        recordedAt: null,
        notation: "fdi",
        findings: [],
        byCondition: {},
      };
    }

    const rows = await db
      .select({
        id: toothRecords.id,
        tooth: toothRecords.tooth,
        condition: toothRecords.condition,
        surfaces: toothRecords.surfaces,
        status: toothRecords.status,
        notes: toothRecords.notes,
        recordedAt: toothRecords.recordedAt,
        recordedBy: users.fullName,
      })
      .from(toothRecords)
      .leftJoin(users, eq(toothRecords.recordedById, users.id))
      .where(eq(toothRecords.chartId, chart.id))
      .orderBy(asc(toothRecords.tooth), asc(toothRecords.recordedAt));

    const byCondition = rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.condition] = (acc[row.condition] ?? 0) + 1;
      return acc;
    }, {});

    return {
      chartId: chart.id,
      recordedAt: chart.recordedAt,
      notation: chart.notation,
      findings: rows,
      byCondition,
    };
  },
);

export type PlanItem = {
  id: string;
  tooth: string | null;
  fee: string;
  status: string;
  sequence: number;
  notes: string | null;
  treatmentName: string | null;
  treatmentCode: string | null;
};

export const getPatientPlan = cache(async (patientId: string): Promise<PlanItem[]> => {
  const db = getDb();
  return db
    .select({
      id: treatmentPlanItems.id,
      tooth: treatmentPlanItems.tooth,
      fee: treatmentPlanItems.fee,
      status: treatmentPlanItems.status,
      sequence: treatmentPlanItems.sequence,
      notes: treatmentPlanItems.notes,
      treatmentName: treatmentTypes.name,
      treatmentCode: treatmentTypes.code,
    })
    .from(treatmentPlanItems)
    .leftJoin(treatmentTypes, eq(treatmentPlanItems.treatmentTypeId, treatmentTypes.id))
    .where(eq(treatmentPlanItems.patientId, patientId))
    .orderBy(asc(treatmentPlanItems.sequence));
});

export type PatientNote = {
  id: string;
  body: string;
  notedAt: Date;
  authorName: string | null;
};

export const getPatientNotes = cache(async (patientId: string): Promise<PatientNote[]> => {
  const db = getDb();
  return db
    .select({
      id: clinicalNotes.id,
      body: clinicalNotes.body,
      notedAt: clinicalNotes.notedAt,
      authorName: users.fullName,
    })
    .from(clinicalNotes)
    .leftJoin(users, eq(clinicalNotes.authorId, users.id))
    .where(eq(clinicalNotes.patientId, patientId))
    .orderBy(desc(clinicalNotes.notedAt))
    .limit(20);
});

export type ClinicStats = {
  patients: number;
  appointmentsToday: number;
  chartsRecorded: number;
  findings: number;
  planValue: string;
};

export const getClinicStats = cache(
  async (clinicId: string, day: string, timeZone: string): Promise<ClinicStats> => {
    const db = getDb();

    const [patientCount, todayCount, chartCount, findingCount, planValue] = await Promise.all([
      db.select({ n: count() }).from(patients).where(eq(patients.clinicId, clinicId)),
      db
        .select({ n: count() })
        .from(appointments)
        .where(
          and(
            eq(appointments.clinicId, clinicId),
            sql`(${appointments.startsAt} AT TIME ZONE ${timeZone})::date = ${day}::date`,
          ),
        ),
      db.select({ n: count() }).from(dentalCharts).where(eq(dentalCharts.clinicId, clinicId)),
      db
        .select({ n: count() })
        .from(toothRecords)
        .innerJoin(dentalCharts, eq(toothRecords.chartId, dentalCharts.id))
        .where(eq(dentalCharts.clinicId, clinicId)),
      db
        .select({
          total: sql<string>`coalesce(sum(${treatmentPlanItems.fee}), 0)::text`,
        })
        .from(treatmentPlanItems)
        .where(
          and(
            eq(treatmentPlanItems.clinicId, clinicId),
            eq(treatmentPlanItems.status, "planned"),
          ),
        ),
    ]);

    return {
      patients: Number(patientCount[0]?.n ?? 0),
      appointmentsToday: Number(todayCount[0]?.n ?? 0),
      chartsRecorded: Number(chartCount[0]?.n ?? 0),
      findings: Number(findingCount[0]?.n ?? 0),
      planValue: planValue[0]?.total ?? "0",
    };
  },
);

export type NextOpening = { day: string; time: string; startsAt: Date } | null;

/**
 * First free consultation slot in the next ten days, based on the practice
 * opening hours and the appointments already in the book.
 */
export const getNextOpening = cache(
  async (clinicId: string, timeZone: string, now: Date = new Date()): Promise<NextOpening> => {
    const db = getDb();
    const horizon: string[] = [];

    for (let offset = 0; offset < 10; offset += 1) {
      const day = shiftDay(todayIn(timeZone, now), offset);
      if (OPENING_HOURS[weekdayIndex(day)]?.length) horizon.push(day);
    }

    if (horizon.length === 0) return null;

    const from = zonedDateTime(horizon[0], "00:00", timeZone);
    const to = zonedDateTime(horizon[horizon.length - 1], "23:59", timeZone);

    const booked = await db
      .select({ startsAt: appointments.startsAt, endsAt: appointments.endsAt })
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicId, clinicId),
          gte(appointments.startsAt, from),
          lte(appointments.startsAt, to),
        ),
      );

    const busy = booked.map((row) => ({ start: row.startsAt.getTime(), end: row.endsAt.getTime() }));

    for (const day of horizon) {
      for (const time of OPENING_HOURS[weekdayIndex(day)]) {
        const startsAt = zonedDateTime(day, time, timeZone);
        if (startsAt.getTime() <= now.getTime()) continue;

        const end = startsAt.getTime() + DEFAULT_CONSULT_MINUTES * 60_000;
        const clash = busy.some((slot) => startsAt.getTime() < slot.end && end > slot.start);
        if (!clash) return { day, time, startsAt };
      }
    }

    return null;
  },
);

export const listPractitioners = cache(async (clinicId: string) => {
  const db = getDb();
  return db
    .select({ id: users.id, fullName: users.fullName, role: users.role, color: users.color })
    .from(users)
    .where(and(eq(users.clinicId, clinicId), eq(users.isActive, true)))
    .orderBy(asc(users.fullName));
});

export const listOperatories = cache(async (clinicId: string) => {
  const db = getDb();
  return db
    .select({
      id: operatories.id,
      name: operatories.name,
      color: operatories.color,
    })
    .from(operatories)
    .where(eq(operatories.clinicId, clinicId))
    .orderBy(asc(operatories.sortOrder));
});

export const listTreatmentTypes = cache(async (clinicId: string) => {
  const db = getDb();
  return db
    .select({
      id: treatmentTypes.id,
      code: treatmentTypes.code,
      name: treatmentTypes.name,
      category: treatmentTypes.category,
      durationMinutes: treatmentTypes.durationMinutes,
      defaultFee: treatmentTypes.defaultFee,
      color: treatmentTypes.color,
    })
    .from(treatmentTypes)
    .where(eq(treatmentTypes.clinicId, clinicId))
    .orderBy(asc(treatmentTypes.code));
});

// ── Auth ───────────────────────────────────────────────────────────────

/** Sign-in lookup. Emails are stored lowercased; compare case-insensitively. */
export const findUserByEmail = cache(async (email: string): Promise<User | null> => {
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${email.toLowerCase()}`)
    .limit(1);
  return user ?? null;
});

export type AccountAppointment = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  kind: string;
  title: string | null;
  reason: string | null;
  practitionerName: string | null;
  operatoryName: string | null;
  treatmentName: string | null;
};

export type AccountDashboard = {
  patient: Patient | null;
  upcoming: AccountAppointment[];
  recent: AccountAppointment[];
  plan: PlanItem[];
  chartSummary: { recordedAt: Date; findings: number; notes: string | null } | null;
};

/**
 * Everything a signed-in patient may see about their own record. The patient
 * id always comes from the session (`users.patient_id`), never from input.
 */
export const getAccountDashboard = cache(
  async (patientId: string | null): Promise<AccountDashboard> => {
    const empty: AccountDashboard = {
      patient: null,
      upcoming: [],
      recent: [],
      plan: [],
      chartSummary: null,
    };
    if (!patientId) return empty;

    const db = getDb();
    const now = new Date();

    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);
    if (!patient) return empty;

    const appointmentColumns = {
      id: appointments.id,
      startsAt: appointments.startsAt,
      endsAt: appointments.endsAt,
      status: appointments.status,
      kind: appointments.kind,
      title: appointments.title,
      reason: appointments.reason,
      practitionerName: users.fullName,
      operatoryName: operatories.name,
      treatmentName: treatmentTypes.name,
    };

    // One .where() per query: Drizzle's builder types do not allow chaining a
    // second .where() after the first, so combine every condition with and().
    const appointmentsFor = (extra: SQL | undefined) =>
      db
        .select(appointmentColumns)
        .from(appointments)
        .leftJoin(users, eq(appointments.practitionerId, users.id))
        .leftJoin(operatories, eq(appointments.operatoryId, operatories.id))
        .leftJoin(treatmentTypes, eq(appointments.treatmentTypeId, treatmentTypes.id))
        .where(and(eq(appointments.patientId, patientId), extra));

    const [upcoming, recent, plan] = await Promise.all([
      appointmentsFor(
        and(
          gte(appointments.startsAt, now),
          sql`${appointments.status} not in ('completed', 'cancelled', 'no_show')`,
        ),
      )
        .orderBy(asc(appointments.startsAt))
        .limit(10),
      appointmentsFor(eq(appointments.status, "completed"))
        .orderBy(desc(appointments.startsAt))
        .limit(5),
      getPatientPlan(patientId),
    ]);

    const [latestChart] = await db
      .select()
      .from(dentalCharts)
      .where(eq(dentalCharts.patientId, patientId))
      .orderBy(desc(dentalCharts.recordedAt))
      .limit(1);

    let chartSummary: AccountDashboard["chartSummary"] = null;
    if (latestChart) {
      const [findingsRow] = await db
        .select({ n: count() })
        .from(toothRecords)
        .where(eq(toothRecords.chartId, latestChart.id));
      chartSummary = {
        recordedAt: latestChart.recordedAt,
        findings: Number(findingsRow?.n ?? 0),
        notes: latestChart.notes,
      };
    }

    return { patient, upcoming, recent, plan, chartSummary };
  },
);
