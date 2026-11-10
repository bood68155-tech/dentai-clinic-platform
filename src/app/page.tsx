import Image from "next/image";
import Link from "next/link";

import { AssistantWidget } from "@/components/marketing/assistant-widget";
import { Carousel } from "@/components/marketing/carousel";
import { ArrowIcon, Roll } from "@/components/marketing/roll";
import { WhyScroller } from "@/components/marketing/why-scroller";
import { Wordmark } from "@/components/marketing/wordmark";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";

const WHY = [
  {
    title: "We don't rush the visit to reach the result.",
    body: "Working towards a healthy mouth doesn't mean skipping the steps it takes to get there. We take pride in the room we practise in, and we know a good experience starts with a good first impression.",
  },
  {
    title: "We treat people, not plans or policies.",
    body: "Our priority is the best care possible, not maxing out a benefit plan or only advising what happens to be covered. We'll look at your needs as a whole and explain the options until you're confident in the plan.",
  },
  {
    title: "We know our craft, and consider care part of it.",
    body: "At Dentai, a good chair-side manner isn't a nice-to-have. We build relationships with our patients that make them feel safe, and that stand the test of time.",
  },
];

const FEATURED = CLINIC_PROFILE.services.slice(0, 4);

const SOCIAL = [
  { src: "/images/instagram-1.webp", pos: "center" },
  { src: "/images/instagram-2.webp", pos: "center" },
  { src: "/images/instagram-3.webp", pos: "center" },
  { src: "/images/instagram-4.webp", pos: "center" },
  { src: "/images/instagram-5.webp", pos: "center" },
  { src: "/images/instagram-6.webp", pos: "center" },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="section">
        <div className="container brand-hero">
          <Link href="/" aria-label="Dentai home" className="brand-wordmark">
            <Wordmark />
          </Link>
          <p className="brand-tagline">
            Considered dentistry —<br />
            crafted for you.
          </p>
        </div>
      </section>

      <SiteHeader />

      <main id="main" className="flex-1">
        <section className="section p-0">
          <div className="media anamorphic zoom-media">
            <Image
              src="/images/reception.webp"
              alt="Warm oak, soft light and a quiet reception at the Dentai clinic"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </section>

        <WhyScroller items={WHY} />

        <section className="section">
          <div className="container">
            <div className="row">
              <div className="col col-4">
                <h2 className="h2 mb-4">Featured Services</h2>
                <Link href="/services" className="button">
                  <Roll>View All</Roll>
                </Link>
              </div>
              <div className="col col-8">
                <div className="media ratio-16x9 mb-6 zoom-media">
                  <Image
                    src="/images/portrait-smile.webp"
                    alt="A patient laughing in the Dentai chair"
                    fill
                    sizes="(min-width: 992px) 66vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10">
              <Carousel label="Featured services">
                {FEATURED.map((service) => (
                  <article key={service.code} className="service-card">
                    <div className="service-card__num">{service.code}</div>
                    <div className="service-card__body">
                      <h3 className="h3">{service.title}</h3>
                      <p className="paragraph-sm max-w-[32ch]">{service.body}</p>
                      <Link href="/services" className="link-arrow">
                        Learn More
                        <span className="btn-icon">
                          <ArrowIcon />
                        </span>
                      </Link>
                    </div>
                  </article>
                ))}
              </Carousel>
            </div>
          </div>
        </section>
        <section className="section gold">
          <div className="split">
            <div className="split__media">
              <Image
                src="/images/lounge.webp"
                alt="The Dentai lounge, with a leather bench and shelves of books"
                fill
                sizes="(min-width: 992px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="split__panel">
              <p className="eyebrow">About the practice</p>
              <h2 className="h2 mt-4 max-w-[15ch]">
                A dentist&rsquo;s office that doesn&rsquo;t feel like one.
              </h2>
              <p className="paragraph-md mt-6 max-w-[38ch]">
                Considered lighting, a chair by the window, and appointments long
                enough to talk. We built the room we would want to be treated in.
              </p>
              <Link href="/about" className="button mt-8">
                <Roll>Our Story</Roll>
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="split">
            <div className="split__panel">
              <p className="eyebrow">New patients</p>
              <h2 className="h2 mt-4 max-w-[15ch]">
                First impressions count. So does the second.
              </h2>
              <p className="paragraph-md mt-6 max-w-[38ch]">
                A sixty-minute first visit, a written plan you can read at home, and
                no pressure to decide anything in the chair.
              </p>
              <Link href="/new-patients" className="button mt-8">
                <Roll>What to Expect</Roll>
              </Link>
            </div>
            <div className="split__media">
              <Image
                src="/images/portrait-smile.webp"
                alt="A couple relaxing together after a visit"
                fill
                sizes="(min-width: 992px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container xtra">
            <div className="row end">
              <div className="col col-8">
                <h2 className="h1 max-w-[16ch]">Come See Us</h2>
              </div>
              <div className="col col-4 flex flex-col items-start gap-6">
                <p className="paragraph-md">
                  From preventive and restorative care to cosmetic and endodontic
                  treatment, Dentai does it all to the same dialled-up degree of comfort
                  and professionalism.
                </p>
                <button type="button" data-book-online className="button">
                  <Roll>Book Online</Roll>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="social-strip" aria-label="Inside the practice">
          {SOCIAL.map((tile, index) => (
            <div key={tile.src + index} className="media zoom-media">
              <Image
                src={tile.src}
                alt=""
                fill
                sizes="(min-width: 768px) 16vw, 33vw"
                style={{ objectPosition: tile.pos }}
                className="object-cover"
              />
            </div>
          ))}
        </section>

      </main>

      <SiteFooter />
      <AssistantWidget />
    </div>
  );
}
