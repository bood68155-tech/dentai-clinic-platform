/** Two stacked copies of a label, so hover can roll it up like the reference. */
export function Roll({ children }: { children: string }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M11.7241 21.3616L0.724122 10.8616L11.7241 0.361573" />
      <path d="M1.22412 10.8616L21.2241 10.8616" />
    </svg>
  );
}
