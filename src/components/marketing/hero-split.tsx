import Image from "next/image";

/**
 * Interior-page hero: heading pinned top-left, intro above the bottom edge and
 * a full-bleed photograph filling the other half. Tone matches the reference's
 * green (About, New Patients), gold (Services) and cream (Contact) heroes.
 */
export function HeroSplit({
  tone = "green",
  title,
  intro,
  src,
  alt,
  priority = false,
}: {
  tone?: "green" | "gold" | "cream";
  title: React.ReactNode;
  intro: React.ReactNode;
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <section className={`section ${tone === "cream" ? "" : tone}`.trim()}>
      <div className="hero-split">
        <div className="hero-split__body">
          <h1 className="h1 max-w-[13ch]">{title}</h1>
          <p className="paragraph-lg max-w-[30ch]">{intro}</p>
        </div>
        <div className="hero-split__media">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(min-width: 992px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
