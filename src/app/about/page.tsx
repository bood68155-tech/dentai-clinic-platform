import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Carousel } from "@/components/marketing/carousel";
import { HeroSplit } from "@/components/marketing/hero-split";
import { ArrowIcon, Roll } from "@/components/marketing/roll";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "About",
  description:
    "Dentai is a SoHo dental practice built around unhurried, considered care. Meet the team and the thinking behind the room.",
};

const PEOPLE = [
  {
    name: "Dr. Maya Ellison",
    role: "Founder & General Dentist",
    src: "/images/team-maya.webp",
    bio: "Twenty years of family practice, with a soft spot for nervous first visits and a firmly unhurried chair.",
  },
  {
    name: "Dr. Jonah Reed",
    role: "Restorative & Implant Dentistry",
    src: "/images/team-jonah.webp",
    bio: "Plans the rebuild before the first instrument comes out, and shows you the same images he works from.",
  },
  {
    name: "Priya Nair",
    role: "Lead Hygienist",
    src: "/images/team-priya.webp",
    bio: "Believes a cleaning should be a conversation, not a countdown. Ask her about the fluoride flavours.",
  },
];

const PRINCIPLES = [
  {
    num: "01",
    title: "Listen before we look.",
    body: "Every visit starts with what brought you in, what you have been avoiding and what you would like the result to feel like.",
  },
  {
    num: "02",
    title: "Explain without jargon.",
    body: "We show you the scan, name the tooth and lay out the options in plain language, including the option to wait.",
  },
  {
    num: "03",
    title: "Finish what we start.",
    body: "One clinician owns your plan from first assessment to final review, so nothing gets lost between appointments.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main id="main" className="flex-1">
        <HeroSplit
          tone="green"
          priority
          src="/images/reception-close.webp"
          alt="The Dentai reception, with oak shelving and soft daylight"
          title={<>Dentistry that feels unhurried.</>}
          intro={<>A small SoHo practice built around one idea: good dentistry should never feel like a production line.</>}
        />

        <section className="section">
          <div className="container xtra">
            <div className="row">
              <div className="col col-4">
                <h2 className="h2">Our Approach</h2>
              </div>
              <div className="col col-8">
                <div className="two-up">
                  <p className="paragraph-lg">
                    We opened on Greene Street because we wanted a room that could be
                    quiet. No television on the ceiling, no script at the front desk —
                    just a calm space, good light and enough time to do the work properly.
                  </p>
                  <p className="paragraph-md">
                    That means longer appointments than you may be used to. It means we
                    photograph and scan before we advise. And it means the person who
                    greets you at the door is likely the person who knows your history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="media anamorphic zoom-media">
          <Image
            src="/images/lounge.webp"
            alt="The Dentai lounge, with a leather bench and warm daylight"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </section>

        <section className="section">
          <div className="container xtra">
            <div className="row">
              <div className="col col-4">
                <p className="eyebrow">The practice</p>
                <h2 className="h2 mt-4 max-w-[16ch]">
                  Care that holds up over years, not just appointments.
                </h2>
              </div>
              <div className="col col-8">
                <p className="paragraph-lg max-w-[46ch]">
                  Most of our patients arrive with a story about a dentist they would
                  rather not return to. We hear it, we take it seriously, and then we
                  try to be the opposite of it.
                </p>
                <p className="paragraph-md mt-6 max-w-[48ch]">
                  Everything in the practice is arranged around that: the appointment
                  length, the way we numb, the fact that we tell you what we are doing
                  before we do it. Considered care is not a slogan here — it is the
                  schedule.
                </p>
              </div>
            </div>

            <div className="num-grid mt-24">
              {PRINCIPLES.map((item) => (
                <div key={item.num} className="num-block">
                  <span className="num-block__num">{item.num}</span>
                  <h3 className="h3">{item.title}</h3>
                  <p className="paragraph-md">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section green">
          <div className="container xtra">
            <div className="row">
              <div className="col col-4">
                <h2 className="h2 max-w-[14ch]">We would rather answer twice than have you guess.</h2>
              </div>
              <div className="col col-8">
                <p className="paragraph-lg max-w-[42ch]">
                  If you have been putting something off, start with a conversation.
                  No treatment plan is agreed until you have seen the evidence and had
                  the chance to ask why.
                </p>
                <button type="button" data-book-online className="button light mt-8">
                  <Roll>Book Online</Roll>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container xtra">
            <div className="row end mb-10">
              <div className="col col-8">
                <p className="eyebrow">Our Team</p>
                <h2 className="h2 mt-4">Excellent care takes excellent people.</h2>
              </div>
              <div className="col col-4 flex justify-end">
                <Link href="/our-team" className="link-arrow">
                  Meet everyone
                  <span className="btn-icon">
                    <ArrowIcon />
                  </span>
                </Link>
              </div>
            </div>

            <Carousel label="Our team" three>
              {PEOPLE.map((person) => (
                <article key={person.name} className="team-card">
                  <div className="media ratio-3x4 zoom-media">
                    <Image
                      src={person.src}
                      alt={person.name}
                      fill
                      sizes="(min-width: 992px) 33vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="name">{person.name}</h3>
                  <p className="role">{person.role}</p>
                  <p className="paragraph-sm">{person.bio}</p>
                </article>
              ))}
            </Carousel>
          </div>
        </section>

        <section className="section gold">
          <div className="container xtra">
            <div className="row">
              <div className="col col-4">
                <h2 className="h2">Join the Team</h2>
              </div>
              <div className="col col-8">
                <p className="paragraph-lg max-w-[42ch]">
                  We are always glad to meet hygienists and dentists who care about the
                  slower version of this work. Send a note and tell us what you would
                  like your days to look like.
                </p>
                <a href="mailto:hello@dentaiclinic.com?subject=Joining%20the%20Dentai%20team" className="button mt-8">
                  <Roll>Get in touch</Roll>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
