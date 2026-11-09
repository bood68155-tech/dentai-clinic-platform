import { Approach } from "@/components/marketing/approach";
import { CareBand } from "@/components/marketing/care-band";
import { Hero } from "@/components/marketing/hero";
import { Services } from "@/components/marketing/services";
import { Visit } from "@/components/marketing/visit";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const CREDENTIALS = [
  "Same-day ceramic crowns",
  "Digital, low-dose X-rays",
  "Mercury-free restorations",
  "Evening & Saturday hours",
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1">
        <Hero />

        <div className="border-b border-forest/10 bg-cream-50">
          <ul className="mx-auto grid w-full max-w-[90rem] grid-cols-2 divide-x divide-forest/10 px-4 sm:px-6 lg:grid-cols-4 lg:px-10">
            {CREDENTIALS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 px-4 py-5 text-[9px] font-extrabold uppercase tracking-[0.17em] text-forest/60 sm:text-[10px] lg:px-6"
              >
                <span className="size-1.5 shrink-0 rounded-full bg-clay" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Services />
        <CareBand />
        <Approach />
        <Visit />
      </main>

      <SiteFooter />
    </div>
  );
}
