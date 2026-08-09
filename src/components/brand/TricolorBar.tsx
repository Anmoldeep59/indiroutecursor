/** Subtle Indian tricolor accent — not a full flag banner */
export function TricolorBar({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`flex h-1 w-full overflow-hidden ${className}`}
    >
      <span className="flex-1 bg-[color:var(--saffron)]" />
      <span className="flex-1 bg-white" />
      <span className="flex-1 bg-[color:var(--india-green)]" />
      <span className="w-8 bg-[color:var(--chakra)]" />
    </div>
  );
}
