type TrustBadgesProps = {
  variant?: "light" | "dark";
  dense?: boolean;
};

const badges = [
  { label: "Proudly Based in India", hint: "🇮🇳 Origin hub" },
  { label: "Shipped from India", hint: "Warehouse ops" },
  { label: "India → Australia", hint: "Beta corridor" },
  { label: "Photo on receive", hint: "Parcel proof" },
];

/**
 * Trust strip — truthful IndiRoute signals only.
 * Do not display DGFT/FIEO/ISO logos unless founder confirms membership.
 */
export function TrustBadges({ variant = "light", dense = false }: TrustBadgesProps) {
  const isDark = variant === "dark";
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${dense ? "justify-start" : "justify-center"}`}
    >
      {badges.map((b) => (
        <div
          key={b.label}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            isDark
              ? "border-white/20 bg-white/5 text-white"
              : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--ink)] shadow-sm"
          }`}
        >
          <span
            className="h-2 w-2 rounded-full bg-[color:var(--saffron)] ring-2 ring-[color:var(--india-green)]/40"
            aria-hidden
          />
          <span>{b.label}</span>
          {!dense ? (
            <span className={isDark ? "text-white/50" : "text-[color:var(--muted)]"}>
              · {b.hint}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
