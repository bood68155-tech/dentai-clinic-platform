"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";

import { ArrowIcon } from "@/components/marketing/roll";

/**
 * Reference slider: arrows, a dot per slide and a hairline of pagination between
 * them. Slides scroll-snap horizontally; no library.
 */
export function Carousel({
  children,
  label,
  three = false,
  className,
}: {
  children: React.ReactNode;
  label: string;
  three?: boolean;
  className?: string;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const count = Children.count(children);
  const [index, setIndex] = useState(0);

  const sync = useCallback(() => {
    const node = viewport.current;
    if (!node) return;
    const first = node.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 40 : node.clientWidth;
    setIndex(Math.round(node.scrollLeft / step));
  }, []);

  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    node.addEventListener("scroll", sync, { passive: true });
    return () => node.removeEventListener("scroll", sync);
  }, [sync]);

  const go = (direction: number) => {
    const node = viewport.current;
    if (!node) return;
    const first = node.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 40 : node.clientWidth;
    node.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <div className={`slider ${className ?? ""}`} aria-roledescription="carousel" aria-label={label}>
      <div ref={viewport} className={`slider-viewport ${three ? "three" : ""}`}>
        {children}
      </div>
      <div className="slider-nav">
        <button type="button" className="button slider-btn" onClick={() => go(-1)} aria-label="Previous slide">
          <span className="btn-icon">
            <ArrowIcon />
          </span>
        </button>
        <div className="slider-dots">
          {Array.from({ length: Math.max(1, count) }).map((_, i) => (
            <button
              key={i}
              type="button"
              className="dot"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => {
                const node = viewport.current;
                const first = node?.firstElementChild as HTMLElement | null;
                if (!node || !first) return;
                node.scrollTo({ left: i * (first.offsetWidth + 40), behavior: "smooth" });
              }}
            />
          ))}
        </div>
        <button type="button" className="button slider-btn" onClick={() => go(1)} aria-label="Next slide">
          <span className="btn-icon rotate-180">
            <ArrowIcon />
          </span>
        </button>
      </div>
    </div>
  );
}
