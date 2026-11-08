import { CLINIC_PROFILE } from "@/lib/clinic-profile";

export function Services() {
  return (
    <section id="treatments" className="border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-clay">
              What we do
            </p>
            <h2 className="mt-4 max-w-lg font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] text-forest">
              Considered care, from first check-up to a full restoration.
            </h2>
          </div>
          <p className="max-w-xs text-[13px] leading-relaxed text-muted lg:text-right">
            Every treatment starts with a conversation and a written plan. Nothing is
            booked before you have seen the number.
          </p>
        </div>

        <div className="mt-14 grid gap-x-14 md:grid-cols-2 lg:grid-cols-3">
          {CLINIC_PROFILE.services.map((service) => (
            <article
              key={service.code}
              className="group border-t border-line py-7 transition-colors hover:border-clay"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-[1.35rem] leading-tight text-forest transition-colors group-hover:text-clay">
                  {service.title}
                </h3>
                <span className="text-[11px] tabular-nums text-muted/70">{service.code}</span>
              </div>
              <p className="mt-3 max-w-[22rem] text-[13px] leading-[1.7] text-muted">
                {service.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
