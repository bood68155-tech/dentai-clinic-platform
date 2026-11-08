import { CheckIcon } from "@/components/icons";

const STEPS = [
  {
    number: "01",
    title: "We listen first",
    body: "A 45-minute first visit. History, habits, worries — then the examination. No production targets in the room.",
  },
  {
    number: "02",
    title: "You see what we see",
    body: "Intraoral photographs and radiographs on a screen beside you, explained in plain language before anything is booked.",
  },
  {
    number: "03",
    title: "Care that fits",
    body: "A written plan with costs, sequencing and alternatives. Stage it over months if that suits your life and your budget.",
  },
];

export function Approach() {
  return (
    <section id="approach" className="px-6 pb-20 lg:pb-28">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] bg-forest px-8 py-14 text-cream lg:px-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sand-deep">
              Our approach
            </p>
            <h2 className="mt-4 font-display text-[clamp(2rem,3.8vw,3.15rem)] leading-[1.03] text-cream">
              A slower kind
              <br />
              of dentistry.
            </h2>
            <p className="mt-6 max-w-sm text-[13px] leading-[1.75] text-cream/65">
              Fewer chairs, longer appointments, and one clinician who knows your mouth.
              It is a simple idea that most clinics cannot afford to run.
            </p>

            <ul className="mt-8 space-y-3 text-[13px] text-cream/80">
              {[
                "Transparent pricing before consent",
                "Mercury-free, minimally invasive",
                "Evening and Saturday appointments",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-sage" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <ol className="space-y-8">
            {STEPS.map((step) => (
              <li key={step.number} className="border-t border-cream/15 pt-6">
                <div className="flex items-baseline gap-5">
                  <span className="font-display text-sm text-clay-soft tabular-nums">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-display text-[1.35rem] leading-tight text-cream">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 max-w-md text-[13px] leading-[1.75] text-cream/60">
                      {step.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-8 border-t border-cream/15 pt-10 sm:grid-cols-4">
          {[
            ["12", "years on Greene Street"],
            ["3", "treatment suites"],
            ["4.9", "average patient rating"],
            ["48h", "typical emergency lead time"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-display text-3xl text-cream">{value}</p>
              <p className="mt-1.5 text-[11px] leading-snug text-cream/50">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
