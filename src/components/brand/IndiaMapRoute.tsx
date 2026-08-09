type IndiaMapRouteProps = {
  className?: string;
  showGlobalHints?: boolean;
};

/**
 * Stylized India hub + export routes.
 * Beta highlight: India → Australia. Other corridors shown as future faint routes.
 */
export function IndiaMapRoute({
  className = "",
  showGlobalHints = true,
}: IndiaMapRouteProps) {
  return (
    <svg
      viewBox="0 0 640 420"
      className={`max-w-full ${className}`}
      role="img"
      aria-label="India logistics map with route to Australia"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a1b30" />
          <stop offset="100%" stopColor="#1a3a5c" />
        </linearGradient>
        <linearGradient id="indiaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff671f" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#f8fafc" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#046a38" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="routeLive" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff671f" />
          <stop offset="50%" stopColor="#1b4f9c" />
          <stop offset="100%" stopColor="#046a38" />
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="640" height="420" rx="24" fill="url(#sea)" />

      {/* Soft India map silhouette (stylized) */}
      <g transform="translate(170,48) scale(1.05)">
        <path
          d="M118 18c18 6 34 22 42 40 8 16 22 28 24 48 2 16-6 30-4 46 2 18 16 28 14 46-2 16-18 24-22 40-4 14 2 30-8 40-12 12-30 8-44 16-12 6-18 22-32 24-16 2-28-12-44-12-14 0-28 10-40 4-14-6-16-24-20-38-4-16 2-32-4-46-6-14-22-18-26-34-4-18 8-34 14-50 6-14 4-32 16-42 14-12 34-6 50-10 14-4 26-18 40-22 12-4 26-2 34 0z"
          fill="url(#indiaFill)"
          opacity="0.95"
          stroke="#fffcf8"
          strokeWidth="2"
        />
        {/* Ashoka-inspired hub node */}
        <circle cx="95" cy="150" r="10" fill="#1b4f9c" />
        <circle cx="95" cy="150" r="16" fill="none" stroke="#1b4f9c" strokeWidth="1.5" opacity="0.5" />
        <text x="95" y="188" textAnchor="middle" fill="#fffcf8" fontSize="12" fontWeight="700">
          INDIA HUB
        </text>
      </g>

      {/* Destination nodes */}
      <g fontSize="11" fontWeight="600" fill="#fffcf8">
        <circle cx="520" cy="300" r="7" fill="#046a38" />
        <text x="520" y="322" textAnchor="middle">
          Australia
        </text>
        {showGlobalHints ? (
          <>
            <circle cx="520" cy="90" r="5" fill="#94a3b8" opacity="0.55" />
            <text x="520" y="110" textAnchor="middle" opacity="0.55">
              USA
            </text>
            <circle cx="470" cy="55" r="5" fill="#94a3b8" opacity="0.45" />
            <text x="470" y="42" textAnchor="middle" opacity="0.45">
              UK
            </text>
            <circle cx="420" cy="130" r="5" fill="#94a3b8" opacity="0.5" />
            <text x="420" y="150" textAnchor="middle" opacity="0.5">
              UAE
            </text>
          </>
        ) : null}
      </g>

      {/* Live Beta route India → Australia */}
      <path
        d="M265 200 C 340 220, 420 250, 520 300"
        fill="none"
        stroke="url(#routeLive)"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="route-dash"
        filter="url(#softGlow)"
      />
      {/* Parcel marker on route */}
      <g className="route-parcel">
        <rect x="385" y="248" width="18" height="14" rx="2" fill="#fffcf8" stroke="#ff671f" />
        <path d="M385 252h18" stroke="#ff671f" strokeWidth="1.5" />
      </g>

      {showGlobalHints ? (
        <g opacity="0.28" stroke="#cbd5e1" strokeWidth="1.5" fill="none" strokeDasharray="4 6">
          <path d="M265 200 C 360 140, 450 100, 520 90" />
          <path d="M265 200 C 340 120, 400 70, 470 55" />
          <path d="M265 200 C 320 160, 370 140, 420 130" />
        </g>
      ) : null}

      <text x="32" y="48" fill="#ff671f" fontSize="13" fontWeight="700">
        Global Network
      </text>
      <text x="32" y="68" fill="#94a3b8" fontSize="11">
        Live now: India → Australia Beta
      </text>
    </svg>
  );
}
