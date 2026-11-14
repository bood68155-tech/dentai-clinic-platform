import type { Metadata } from "next";
import Image from "next/image";

import { AssistantWidget } from "@/components/marketing/assistant-widget";
import { Roll } from "@/components/marketing/roll";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet Dr. Ayman Saleh and Dr. Leila Mohammad, the dentists behind NUV in Khan Yunis, Gaza.",
};

const TEAM = [
  {
    name: "Dr. Ayman Saleh",
    role: "Lead Dentist / Implantologist",
    src: "/images/team-ayman.webp",
    alt: "Dr. Ayman Saleh, lead dentist and implantologist at NUV",
    bio: "Leads the practice and has spent twenty years restoring smiles, with a particular focus on implants and full-mouth rehabilitation. He still takes the emergency calls himself and has a soft spot for nervous first visits.",
  },
  {
    name: "Dr. Leila Mohammad",
    role: "Orthodontist / Dentist",
    src: "/images/team-leila.webp",
    alt: "Dr. Leila Mohammad, orthodontist and dentist at NUV",
    bio: "Plans alignment cases around the whole face rather than the arch alone, from clear aligners to fixed braces. She shows you the same scans she works from and is honest about how long a result will take.",
  },
];

export default function OurTeamPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main id="main" className="flex-1">
        <section className="section">
          <div className="container top-spacer">
            <p className="eyebrow">Our Team</p>
            <h1 className="h1 mt-6 max-w-[20ch]">Excellent care takes excellent people.</h1>
          </div>
        </section>

        <section className="section">
          <div className="container xtra">
            <div className="row">
              <div className="col col-4">
                <p className="paragraph-lg max-w-[24ch]">
                  Two dentists, one room, and a shared dislike of being rushed.
                </p>
              </div>
              <div className="col col-8">
                <p className="paragraph-md max-w-[44ch]">
                  Both doctors chose a smaller practice on purpose. That means fewer
                  patients per day, longer appointments, and clinicians who know your
                  history without opening a file.
                </p>
              </div>
            </div>

            <div className="row mt-20 gap-y-16">
              {TEAM.map((person) => (
                <div key={person.name} className="col col-6">
                  <article className="team-card">
                    <div className="media ratio-3x4 zoom-media">
                      <Image
                        src={person.src}
                        alt={person.alt}
                        fill
                        sizes="(min-width: 992px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <h2 className="name mt-2">{person.name}</h2>
                    <p className="role">{person.role}</p>
                    <p className="paragraph-md max-w-[40ch]">{person.bio}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section green">
          <div className="container xtra">
            <div className="row">
              <div className="col col-4">
                <h2 className="h2">Come See Us</h2>
              </div>
              <div className="col col-8">
                <p className="paragraph-lg max-w-[42ch]">
                  The best way to meet the team is in the chair. Book a first visit and
                  we will take it slowly.
                </p>
                <button type="button" data-book-online className="button light mt-8">
                  <Roll>Book Online</Roll>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <AssistantWidget />
    </div>
  );
}
