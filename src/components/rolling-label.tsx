/**
 * Shared chrome for the reference-style buttons.
 *
 * `RollingLabel` renders the two stacked copies the hover roll needs; the
 * duplicate is aria-hidden so the accessible name is announced once.
 * `RollingChip` is the square chip that swaps its arrow diagonally.
 * Both are presentation only, so server and client components can use them.
 */
export function RollingLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="btn-label">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

export function RollingChip() {
  return <span className="btn-chip" aria-hidden="true" />;
}
