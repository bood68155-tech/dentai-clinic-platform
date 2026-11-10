import type { Metadata } from "next";
import Image from "next/image";

import { Roll } from "@/components/marketing/roll";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the dentists, hygienists and front-desk team at Dentai in SoHo, New York.",
};

const TEAM = [
  {
    name: "Dr. Maya Ellison",
    role: "Founder & General Dentist",
    src: "/images/team-maya.webp",
    bio: "Twenty years of family practice, with a soft spot for nervous first visits and a firmly unhurried chair. Trained at NYU, and still takes the emergency calls herself.",
  },
  {
    name: "Dr. Jonah Reed",
    role: "Restorative & Implant Dentistry",
    src: "/images/team-jonah.webp",
    bio: "Plans the rebuild before the first instrument comes out, and shows you the same images he works from. Particular about single-visit crowns and honest timelines.",
  },
  {
    name: "Priya Nair",
    role: "Lead Hygienist",
    src: "/images/team-priya.webp",
    bio: "Believes a cleaning should be a conversation, not a countdown. Ask her about the fluoride flavours, or which corner of the room has the best light.",
  },
  {
    name: "Tomás Herrera",
    role: "Practice Manager",
    src: "/images/team-tomas.webp",
    bio: "The person who answers the phone and remembers your name. Handles insurance, estimates and the diary, and will tell you plainly what something will cost.",
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
                  Four people, one room, and a shared dislike of being rushed.
                </p>
              </div>
              <div className="col col-8">
                <p className="paragraph-md max-w-[44ch]">
                  Everyone here has chosen a smaller practice on purpose. That means
                  fewer patients per day, longer appointments, and clinicians who know
                  your history without opening a file.
                </p>
              </div>
            </div>

            <div className="row mt-20 gap-y-16">
              {TEAM.map((person) => (
                <div key={person.name} className="col col-6">
                  <article className="team-card">
                    <div className="media ratio-4x3 zoom-media">
                      <Image
                        src={person.src}
                        alt={person.name}
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
    </div>
  );
}
