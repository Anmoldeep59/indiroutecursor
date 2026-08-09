import Image from "next/image";

/** Full-bleed freight hero composition: India skyline motif + air cargo + logo */
export function HeroFreightVisual() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#123056] via-[#0f2744] to-[#0a1b30] shadow-2xl">
      {/* India map watermark */}
      <svg
        aria-hidden
        viewBox="0 0 200 260"
        className="pointer-events-none absolute -right-6 top-4 h-[120%] w-auto opacity-[0.14]"
      >
        <path
          d="M100 12c22 8 40 28 48 50 10 24 28 36 30 58 2 20-8 38-6 56 2 20 18 34 16 54-2 18-20 28-24 46-4 16 4 34-8 46-14 14-36 8-52 18-14 8-22 26-40 28-18 2-34-14-52-14-16 0-34 12-48 4-16-8-20-28-24-46-4-20 4-38-4-56-8-18-26-22-30-42-4-22 10-40 16-58 8-18 4-38 18-50C48 20 72 28 90 22c12-4 28-4 40-10z"
          fill="#fffcf8"
        />
      </svg>

      {/* Arch / landmark motif */}
      <svg
        aria-hidden
        viewBox="0 0 120 80"
        className="pointer-events-none absolute bottom-0 left-0 w-40 opacity-20"
      >
        <path
          d="M10 78 V34 Q60 0 110 34 V78"
          fill="none"
          stroke="#ff671f"
          strokeWidth="3"
        />
        <rect x="52" y="48" width="16" height="30" fill="#ff671f" opacity="0.5" />
      </svg>

      <div className="relative px-6 pb-6 pt-8 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--saffron)]">
            Indian trade gateways
          </p>
          <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-white/70">
            JNPT · DEL · BOM · MAA
          </span>
        </div>

        {/* Cargo aircraft over India */}
        <svg viewBox="0 0 360 160" className="mt-4 w-full" aria-hidden>
          <defs>
            <linearGradient id="wake" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff671f" stopOpacity="0" />
              <stop offset="40%" stopColor="#ff671f" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#046a38" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path
            d="M20 110 C 90 90, 160 70, 240 55"
            fill="none"
            stroke="url(#wake)"
            strokeWidth="2.5"
            className="route-dash"
          />
          {/* Plane */}
          <g transform="translate(240,40)" className="freight-plane">
            <path
              d="M0 12 L48 8 L56 12 L48 16 L0 14 Z"
              fill="#fffcf8"
            />
            <path d="M18 12 L28 0 L34 2 L28 12" fill="#ff671f" />
            <path d="M18 14 L28 28 L34 26 L28 14" fill="#1b4f9c" />
            <rect x="8" y="9" width="10" height="8" rx="1" fill="#046a38" opacity="0.85" />
          </g>
          {/* Port / skyline suggestion */}
          <g opacity="0.45" fill="#94a3b8">
            <rect x="24" y="118" width="14" height="28" />
            <rect x="42" y="108" width="12" height="38" />
            <rect x="58" y="124" width="18" height="22" />
            <rect x="80" y="112" width="10" height="34" />
            <rect x="96" y="120" width="22" height="26" />
          </g>
          <text x="24" y="158" fill="#94a3b8" fontSize="10">
            Cargo airlift from Indian hubs
          </text>
        </svg>

        <div className="mt-2 flex justify-center">
          <Image
            src="/brand/logo-on-dark.png"
            alt="IndiRoute"
            width={160}
            height={104}
            className="bg-transparent object-contain"
            style={{ backgroundColor: "transparent", width: "auto", height: "auto" }}
            priority
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="rounded-full bg-[color:var(--saffron)] px-3 py-1 font-bold text-[#0a1b30]">
            🇮🇳 India
          </span>
          <span className="text-[color:var(--saffron)]" aria-hidden>
            ······✈······
          </span>
          <span className="rounded-full bg-[color:var(--india-green)] px-3 py-1 font-bold text-white">
            🇦🇺 Australia
          </span>
        </div>
        <p className="mt-3 text-center text-xs text-white/60">
          Personal locker · Package photos · Consolidate · Track
        </p>
      </div>

      {/* Tricolor fleet stripe */}
      <div className="flex h-1.5 w-full">
        <span className="flex-1 bg-[color:var(--saffron)]" />
        <span className="flex-1 bg-white" />
        <span className="flex-1 bg-[color:var(--india-green)]" />
      </div>
    </div>
  );
}
