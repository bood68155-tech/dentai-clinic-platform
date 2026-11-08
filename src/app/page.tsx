import { Approach } from "@/components/marketing/approach";
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

        <div className="border-y border-line bg-cream-50/60">
          <ul className="mx-auto grid w-full max-w-6xl grid-cols-2 divide-x divide-line/70 lg:grid-cols-4">
            {CREDENTIALS.map((item) => (
              <li
                key={item}
                className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest/60 sm:text-[11px]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Services />
        <Approach />
        <Visit />
      </main>

      <SiteFooter />
    </div>
  );
}
