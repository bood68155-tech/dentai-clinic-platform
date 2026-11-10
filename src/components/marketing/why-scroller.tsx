"use client";

import { useEffect, useRef } from "react";

export type WhyItem = { title: string; body: string };

/**
 * The reference pins this band and drives three full-width cards sideways as
 * the page scrolls, with the numerals bleeding off the edges. Vertical scroll
 * is translated into horizontal movement; below 992px the cards simply stack.
 */
export function WhyScroller({ items }: { items: WhyItem[] }) {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = section.current;
    const rail = track.current;
    if (!node || !rail) return;
    if (window.matchMedia("(max-width: 991px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const distance = node.offsetHeight - window.innerHeight;
      if (distance <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      const travel = Math.max(0, rail.scrollWidth - window.innerWidth);
      rail.style.transform = `translate3d(${-progress * travel}px, 0, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="section why" ref={section} aria-label="Why choose Dentai">
      <div className="why-sticky">
        <div className="container why-head">
          <div className="row flush">
            <div className="col col-12">
              <h2 className="h2">Why Choose Us</h2>
            </div>
          </div>
        </div>
        <div className="why-track" ref={track}>
          {items.map((item, i) => (
            <article key={item.title} className="why-card">
              <div className="why-num">{String(i + 1).padStart(2, "0")}</div>
              <div className="why-text">
                <h3 className="paragraph-lg mb-4">{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
