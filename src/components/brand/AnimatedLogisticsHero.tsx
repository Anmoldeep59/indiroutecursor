import Image from "next/image";

/** Layered India-logistics hero with courier, parcels, globe & route motion */
export function AnimatedLogisticsHero() {
  return (
    <div className="hero-stage relative mx-auto mb-8 w-full max-w-[520px] pb-10 sm:pb-12">
      <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-[color:var(--saffron)]/20 via-transparent to-[color:var(--india-green)]/20 blur-2xl" />

      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/15 bg-gradient-to-b from-[#163457] to-[#0a1b30] p-4 pb-16 shadow-2xl sm:p-6 sm:pb-20">
        {/* Soft globe */}
        <div className="hero-globe absolute -right-8 top-2 h-56 w-56 rounded-full opacity-40 sm:h-64 sm:w-64" aria-hidden>
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_35%_35%,#7dd3c0_0%,#1b4f9c_45%,#0a1b30_75%)]" />
          <div className="absolute inset-0 rounded-full opacity-30 [background:repeating-linear-gradient(90deg,transparent,transparent_18px,rgba(255,255,255,0.15)_19px),repeating-linear-gradient(0deg,transparent,transparent_22px,rgba(255,255,255,0.1)_23px)]" />
        </div>

        {/* Floating parcels */}
        <div className="parcel parcel-a absolute left-3 top-8 h-10 w-12 rounded-sm bg-[color:var(--saffron)] shadow-lg" aria-hidden>
          <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#0a1b30]/40" />
          <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-[#0a1b30]/40" />
        </div>
        <div className="parcel parcel-b absolute right-10 top-16 h-8 w-10 rounded-sm bg-[#f59e0b] shadow-lg" aria-hidden />
        <div className="parcel parcel-c absolute bottom-24 left-6 h-9 w-11 rounded-sm bg-[#dc2626] shadow-lg" aria-hidden />

        {/* Courier illustration (SVG recreation) */}
        <svg viewBox="0 0 320 340" className="hero-courier relative z-10 mx-auto h-auto w-[88%] max-w-[340px]" aria-hidden>
          <ellipse cx="160" cy="318" rx="90" ry="12" fill="#000" opacity="0.25" />
          {/* legs */}
          <rect x="128" y="230" width="22" height="70" rx="8" fill="#1e3a5f" />
          <rect x="170" y="230" width="22" height="70" rx="8" fill="#1e3a5f" />
          <rect x="122" y="292" width="34" height="12" rx="4" fill="#0a1b30" />
          <rect x="164" y="292" width="34" height="12" rx="4" fill="#0a1b30" />
          {/* torso */}
          <path d="M110 140 h100 l12 90 h-124 z" fill="#1b4f9c" />
          <path d="M120 140 h80 v18 h-80 z" fill="#163f7d" />
          {/* backpack */}
          <rect x="205" y="150" width="36" height="55" rx="8" fill="#111827" />
          <rect x="212" y="158" width="22" height="18" rx="3" fill="#374151" />
          {/* arms + tablet */}
          <path d="M110 160 c-20 10 -28 40 -18 55" stroke="#fbbf24" strokeWidth="14" strokeLinecap="round" fill="none" />
          <path d="M210 160 c20 10 28 40 18 55" stroke="#fbbf24" strokeWidth="14" strokeLinecap="round" fill="none" />
          <rect x="125" y="200" width="70" height="44" rx="6" fill="#0f2744" stroke="#94a3b8" strokeWidth="2" />
          <rect x="133" y="208" width="54" height="28" rx="3" fill="#38bdf8" opacity="0.85" />
          {/* head */}
          <circle cx="160" cy="108" r="34" fill="#f3c7a4" />
          <path d="M128 95 c10 -28 54 -28 64 0" fill="#ff671f" />
          <rect x="126" y="88" width="68" height="14" rx="4" fill="#e11d48" />
          <circle cx="148" cy="110" r="3" fill="#0a1b30" />
          <circle cx="172" cy="110" r="3" fill="#0a1b30" />
          <path d="M150 124 q10 8 20 0" stroke="#0a1b30" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>

        {/* Shopping bags / India marketplace cue */}
        <div className="absolute bottom-4 left-4 z-20 flex items-end gap-2">
          <div className="bag-bob rounded-md bg-white px-2 py-2 text-[10px] font-bold text-[color:var(--ink)] shadow-md">
            <span className="text-[color:var(--saffron)]">M</span> shops
          </div>
          <div className="bag-bob bag-delay rounded-md bg-[color:var(--saffron)] px-2 py-2 text-[10px] font-bold text-[#0a1b30] shadow-md">
            Flipkart+
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-20 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur">
          🇮🇳 → 🇦🇺 live
        </div>

        {/* Plane flyover */}
        <div className="hero-plane absolute left-0 top-6 text-2xl" aria-hidden>
          ✈
        </div>
      </div>

      {/* Fleet cutout peek */}
      <div className="truck-drive pointer-events-none absolute -bottom-3 left-1/2 z-30 w-[70%] -translate-x-1/2 sm:w-[60%]">
        <Image
          src="/brand/fleet/india-truck-art-lg.png"
          alt=""
          width={400}
          height={220}
          className="h-auto w-full drop-shadow-2xl"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      </div>
    </div>
  );
}
