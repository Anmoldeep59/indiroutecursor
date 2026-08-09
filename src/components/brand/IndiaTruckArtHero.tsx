/** Festive Indian truck-art hero visual — IndiRoute branded, not a competitor clone. */
export function IndiaTruckArtHero() {
  return (
    <div className="hero-stage relative mx-auto w-full max-w-[480px]">
      <div
        className="pointer-events-none absolute -inset-8 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(245,166,35,0.45), transparent 55%), radial-gradient(circle at 70% 70%, rgba(236,72,153,0.25), transparent 50%)",
        }}
        aria-hidden
      />
      <svg
        viewBox="0 0 420 480"
        className="relative z-10 h-auto w-full drop-shadow-2xl"
        role="img"
        aria-label="Indian truck art: Bringing India to you"
      >
        <defs>
          <linearGradient id="truckBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff2d6a" />
            <stop offset="45%" stopColor="#ff8a00" />
            <stop offset="100%" stopColor="#ffd60a" />
          </linearGradient>
          <linearGradient id="truckRoof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b4f9c" />
            <stop offset="100%" stopColor="#0f2744" />
          </linearGradient>
          <linearGradient id="floral" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffe566" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="210" cy="455" rx="140" ry="16" fill="#000" opacity="0.28" />

        {/* Truck cabin body */}
        <path
          d="M70 180 C70 120 120 70 210 70 C300 70 350 120 350 180 L360 320 C360 340 340 355 210 355 C80 355 60 340 60 320 Z"
          fill="url(#truckBody)"
        />
        <path
          d="M95 175 C95 130 140 95 210 95 C280 95 325 130 325 175 L330 250 C330 265 300 275 210 275 C120 275 90 265 90 250 Z"
          fill="#fff"
          opacity="0.12"
        />

        {/* Top ornamental crown */}
        <path
          d="M140 70 Q210 20 280 70"
          fill="none"
          stroke="#ffd60a"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle cx="210" cy="42" r="22" fill="#1b4f9c" stroke="#ffd60a" strokeWidth="4" />
        <circle cx="210" cy="42" r="10" fill="#ff671f" />

        {/* Floral side ornaments */}
        {[110, 310].map((cx) => (
          <g key={cx} opacity="0.95">
            <circle cx={cx} cy="220" r="28" fill="#fff" opacity="0.2" />
            <path
              d={`M${cx} 195 C${cx + 18} 210 ${cx + 18} 230 ${cx} 245 C${cx - 18} 230 ${cx - 18} 210 ${cx} 195`}
              fill="#ffd60a"
            />
            <circle cx={cx} cy="220" r="8" fill="#e11d48" />
          </g>
        ))}

        {/* Central sign board */}
        <rect x="105" y="185" width="210" height="70" rx="10" fill="url(#truckRoof)" stroke="#ffd60a" strokeWidth="4" />
        <text
          x="210"
          y="215"
          textAnchor="middle"
          fill="#ffd60a"
          fontSize="13"
          fontWeight="800"
          fontFamily="Montserrat, system-ui, sans-serif"
          letterSpacing="1.5"
        >
          BRINGING INDIA
        </text>
        <text
          x="210"
          y="238"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="18"
          fontWeight="900"
          fontFamily="Montserrat, system-ui, sans-serif"
          letterSpacing="2"
        >
          TO YOU
        </text>

        {/* Bumper strip */}
        <rect x="85" y="300" width="250" height="18" rx="6" fill="#0a1b30" />
        <rect x="95" y="304" width="50" height="10" rx="3" fill="#ffd60a" />
        <rect x="185" y="304" width="50" height="10" rx="3" fill="#046a38" />
        <rect x="275" y="304" width="50" height="10" rx="3" fill="#ff671f" />

        {/* Grill */}
        <rect x="140" y="275" width="140" height="22" rx="4" fill="#111827" />
        {[155, 175, 195, 215, 235, 255].map((x) => (
          <rect key={x} x={x} y="278" width="8" height="16" rx="2" fill="#6b7280" />
        ))}

        {/* Headlights */}
        <circle cx="100" cy="285" r="16" fill="#fef3c7" stroke="#ffd60a" strokeWidth="3" />
        <circle cx="320" cy="285" r="16" fill="#fef3c7" stroke="#ffd60a" strokeWidth="3" />
        <circle cx="100" cy="285" r="7" fill="#fde68a" />
        <circle cx="320" cy="285" r="7" fill="#fde68a" />

        {/* Decorative hanging bells */}
        {[130, 170, 210, 250, 290].map((x, i) => (
          <g key={x}>
            <line x1={x} y1="355" x2={x} y2={375 + (i % 2) * 6} stroke="#ffd60a" strokeWidth="2" />
            <circle cx={x} cy={382 + (i % 2) * 6} r="6" fill="#e11d48" stroke="#ffd60a" strokeWidth="1.5" />
          </g>
        ))}

        {/* Wheels */}
        <circle cx="130" cy="400" r="38" fill="#1f2937" />
        <circle cx="130" cy="400" r="22" fill="#9ca3af" />
        <circle cx="130" cy="400" r="8" fill="#111827" />
        <circle cx="290" cy="400" r="38" fill="#1f2937" />
        <circle cx="290" cy="400" r="22" fill="#9ca3af" />
        <circle cx="290" cy="400" r="8" fill="#111827" />

        {/* Floral vine strokes */}
        <path
          d="M90 160 C120 140 150 150 160 170"
          fill="none"
          stroke="url(#floral)"
          strokeWidth="3"
          opacity="0.7"
        />
        <path
          d="M330 160 C300 140 270 150 260 170"
          fill="none"
          stroke="url(#floral)"
          strokeWidth="3"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}
