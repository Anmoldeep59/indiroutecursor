import Image from "next/image";

/** Animated multimodal logistics collage using processed assets + SVG overlays */
export function MultimodalScene() {
  return (
    <div className="multi-scene relative overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,103,31,0.12),transparent_40%)]" />
      <div className="relative grid items-center gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[220px]">
          <Image
            src="/brand/lifestyle/india-multimodal-lg.png"
            alt="India logistics map with air, sea and road freight"
            width={640}
            height={420}
            className="multi-map relative z-10 mx-auto h-auto w-full max-w-md object-contain"
            style={{ width: "auto", height: "auto" }}
          />
          <span className="multi-plane absolute left-2 top-4 text-3xl" aria-hidden>
            ✈
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--saffron)]">
            Global network
          </p>
          <h3 className="mt-2 text-2xl font-bold text-[color:var(--ink)]">
            Air · Sea · Road — India first
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
            Your parcels start in India — marketplace pickup, warehouse photos, consolidation —
            then move toward Australia on the live Beta corridor.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[color:var(--ink)]">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[color:var(--saffron)]" />
              Marketplace parcels into your IND locker
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[color:var(--chakra)]" />
              Consolidate before you pay to ship
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[color:var(--india-green)]" />
              AUD checkout · Australia delivery
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
