import type { SVGProps } from "react";

export function ToothMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3.2c-1.6 0-2.3.9-3.9.9-1.3 0-2.4-.6-3.4.2C3.5 5.2 3.3 7 3.7 8.9c.4 1.9.7 2.6 1 4.6.2 1.4.3 2.4.6 3.9.2 1.1.5 2.3 1.4 2.8.9.5 1.8-.2 2.2-1.2.5-1.1.6-2.5.9-3.8.2-1.1.6-1.9 1.2-1.9s1 .8 1.2 1.9c.3 1.3.4 2.7.9 3.8.4 1 1.3 1.7 2.2 1.2.9-.5 1.2-1.7 1.4-2.8.3-1.5.4-2.5.6-3.9.3-2 .6-2.7 1-4.6.4-1.9.2-3.7-1-4.6-1-.8-2.1-.2-3.4-.2-1.6 0-2.3-.9-3.9-.9Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 10h11m0 0-4.2-4.2M15 10l-4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M10 6v4.2l2.6 1.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 17s5.2-4.5 5.2-8.2A5.2 5.2 0 0 0 4.8 8.8C4.8 12.5 10 17 10 17Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8.6" r="1.9" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6.2 3.5H4.4c-.8 0-1.4.7-1.2 1.5.6 3 2.2 5.9 4.4 8.1 2.2 2.2 5 3.8 8.1 4.4.8.2 1.5-.4 1.5-1.2v-1.8c0-.7-.5-1.2-1.2-1.4l-1.7-.4c-.6-.1-1.1.1-1.5.6l-.5.7a12 12 0 0 1-4.5-4.5l.7-.5c.5-.4.7-.9.6-1.5l-.4-1.7c-.2-.7-.7-1.2-1.4-1.2Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ImageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
      <circle cx={8.5} cy={8.5} r={1.5} />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

export function ReceiptIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 2h16v4H4z" />
      <path d="M4 10h16v10H4z" />
      <path d="M8 14h2" />
      <path d="M12 14h2" />
      <path d="M16 14h2" />
      <path d="M8 18h8" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="m4.5 10.5 3.3 3.2 7.7-7.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="m12 5-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="m8 5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
