/** Placeholder identity mark — replace with your own. */
export default function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 24" fill="none" className={className} aria-hidden>
      <rect x="0" y="0" width="24" height="24" fill="currentColor" />
      <circle cx="36" cy="12" r="12" fill="currentColor" />
    </svg>
  );
}
