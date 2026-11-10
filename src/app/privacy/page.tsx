import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Dentai handles the information you share with the practice.",
};

const SECTIONS = [
  {
    title: "What we collect",
    body: "When you send the contact form or book online we receive the name, email address, phone number and message you choose to give us. If you become a patient, your clinical records are kept separately in our practice management system.",
  },
  {
    title: "How we use it",
    body: "We use your details to answer your enquiry, arrange and confirm appointments, and send the occasional practice update if you ask for it. We do not sell or rent your information, and we do not pass it to advertisers.",
  },
  {
    title: "Who can see it",
    body: "Only the Dentai team and the service providers who host our website and email. Where a specialist or laboratory is involved in your care, we share only what is clinically necessary and tell you first.",
  },
  {
    title: "Keeping it",
    body: "Enquiries that do not become appointments are deleted after twelve months. Clinical records are retained for the period required by New York State law and professional guidance.",
  },
  {
    title: "Your choices",
    body: `You can ask to see, correct or delete the information we hold about you at any time by emailing ${CLINIC_PROFILE.email}. Newsletter emails include an unsubscribe link, and you can also simply reply and ask us to stop.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main id="main" className="flex-1">
        <section className="section">
          <div className="container top-spacer">
            <p className="eyebrow">Legal</p>
            <h1 className="h1 mt-6">Privacy Policy</h1>
            <p className="paragraph-lg mt-8 max-w-[40ch]">
              A short version, in plain English: we collect what we need to care for
              you, and nothing else.
            </p>
          </div>
        </section>

        <section className="section border-t">
          <div className="container xtra">
            <div className="row">
              <div className="col col-4">
                <p className="paragraph-sm">Last updated — November 2026</p>
              </div>
              <div className="col col-8">
                {SECTIONS.map((section) => (
                  <div key={section.title} className="border-t border-[color:var(--ref-border)] py-8 last:border-b">
                    <h2 className="h3">{section.title}</h2>
                    <p className="paragraph-md mt-3 max-w-[52ch]">{section.body}</p>
                  </div>
                ))}
                <p className="paragraph-md mt-8 max-w-[52ch]">
                  Questions about any of this? Write to{" "}
                  <a href={`mailto:${CLINIC_PROFILE.email}`} className="link-underline">
                    {CLINIC_PROFILE.email}
                  </a>{" "}
                  and a person will answer.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
