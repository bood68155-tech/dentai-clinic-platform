/**
 * The oversized NUV wordmark. The reference sets its logo as an SVG path
 * that always spans the container, so the site name is drawn as SVG text with
 * `textLength` doing the same job at any viewport.
 */
export function Wordmark({
  className,
  title = "NUV",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 1000 196"
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      <text
        x="0"
        y="188"
        textLength="1000"
        lengthAdjust="spacingAndGlyphs"
        fill="currentColor"
        fontFamily="var(--font-manrope), Manrope, sans-serif"
        fontWeight="800"
        fontSize="236"
        letterSpacing="-10"
      >
        NUV
      </text>
    </svg>
  );
}
