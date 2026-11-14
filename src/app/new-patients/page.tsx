import type { Metadata } from "next";
import Image from "next/image";

import { AssistantWidget } from "@/components/marketing/assistant-widget";
import { HeroSplit } from "@/components/marketing/hero-split";
import { Roll } from "@/components/marketing/roll";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";

export const metadata: Metadata = {
  title: "New Patients",
  description:
    "What to expect at your first visit to NUV in Khan Yunis — paperwork, assessment, and a plan you can read at home.",
};

const STEPS = [
  {
    num: "01",
    title: "Before you arrive",
    body: "Complete the short health form online. Bring a photo ID and your insurance card if you have one. If you are anxious, tell us — the note reaches the clinician, not just the front desk.",
  },
  {
    num: "02",
    title: "The first visit",
    body: "Sixty minutes. We talk first, then photograph, scan and examine. You leave with findings in plain language and no obligation to book anything on the day.",
  },
  {
    num: "03",
    title: "The plan",
    body: "Within two working days you receive a written plan with options, staged costs and the honest recommendation. Questions are answered by email or at a second short visit.",
  },
];

const FAQ = [
  {
    q: "Do you take my insurance?",
    a: "We are in-network with most major PPO plans and submit claims on your behalf. Send a photo of your card before the visit and we will confirm your benefits in writing.",
  },
  {
    q: "I have not seen a dentist in years. Will I be judged?",
    a: "No. We ask what has been difficult, not why you stayed away. The first appointment is an assessment and a conversation; there is no lecture and no pressure to fix everything at once.",
  },
  {
    q: "What does a first visit cost?",
    a: "The new-patient exam, photographs and necessary radiographs are quoted before you book, and the figure does not change on the day. Any treatment is priced separately in your plan.",
  },
  {
    q: "Can I bring my child?",
    a: "Yes. Children are welcome from age three, and we keep a quiet corner by the window for siblings. Let us know when booking so we can allow the extra time.",
  },
  {
    q: "What if I need urgent care?",
    a: "Call the front desk and we will make room the same day where we can. If the practice is closed, the voicemail gives the number for our out-of-hours line.",
  },
];

export default function NewPatientsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main id="main" className="flex-1">
        <HeroSplit
          tone="green"
          priority
          src="/images/couple.webp"
          alt="A couple smiling together at home"
          title={<>First impressions count.</>}
          intro={<>So does the second, and the tenth. Here is exactly what happens from the moment you book.</>}
        />

        <section className="section">
          <div className="container xtra">
            <div className="row mb-20">
              <div className="col col-4">
                <h2 className="h2">What to Expect</h2>
              </div>
              <div className="col col-8">
                <p className="paragraph-lg max-w-[44ch]">
                  No surprises, no upsell, no being talked over. Three steps, each
                  with a clear purpose.
                </p>
              </div>
            </div>

            <div className="num-grid">
              {STEPS.map((step) => (
                <div key={step.num} className="num-block">
                  <span className="num-block__num">{step.num}</span>
                  <h3 className="h3">{step.title}</h3>
                  <p className="paragraph-md">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="media anamorphic zoom-media">
          <Image
            src="/images/meadow.webp"
            alt="A walk through the meadow in knitted socks"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </section>

        <section className="section" id="faq">
          <div className="container xtra">
            <div className="row">
              <div className="col col-4">
                <p className="eyebrow">Questions</p>
                <h2 className="h2 mt-4">Answers, before you ask.</h2>
                <p className="paragraph-md mt-6 max-w-[26ch]">
                  Still unsure about something? Call{" "}
                  <a href={CLINIC_PROFILE.phoneHref} className="link-underline">
                    {CLINIC_PROFILE.phone}
                  </a>{" "}
                  and a person will pick up.
                </p>
              </div>
              <div className="col col-8">
                <div className="faq-list">
                  {FAQ.map((item) => (
                    <details key={item.q} className="faq-item">
                      <summary>
                        <span className="q">{item.q}</span>
                        <span className="faq-plus" aria-hidden="true" />
                      </summary>
                      <p className="a paragraph-md">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section gold">
          <div className="container xtra">
            <div className="row">
              <div className="col col-8">
                <h2 className="h1 max-w-[18ch]">We&rsquo;d love to meet you.</h2>
              </div>
              <div className="col col-4 flex flex-col items-start justify-end gap-6">
                <p className="paragraph-md">
                  Same-week appointments are usually available. Bring your questions.
                </p>
                <button type="button" data-book-online className="button">
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
