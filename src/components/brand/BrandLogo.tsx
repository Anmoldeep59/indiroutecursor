import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string | null;
  /** light = on navy/dark surfaces; dark = on ivory/light surfaces */
  variant?: "light" | "dark";
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * Transparent IndiRoute mark — never wrap in a black square.
 * Uses pre-keyed PNGs with no opaque black plate.
 */
export function BrandLogo({
  href = "/",
  variant = "light",
  showWordmark = true,
  size = "md",
  className = "",
}: BrandLogoProps) {
  const dims = {
    sm: { w: 44, h: 28, text: "text-base", maxH: "max-h-7" },
    md: { w: 56, h: 36, text: "text-xl", maxH: "max-h-9" },
    lg: { w: 80, h: 52, text: "text-2xl", maxH: "max-h-12" },
  }[size];

  const src =
    variant === "light" ? "/brand/logo-on-dark.png" : "/brand/logo-on-light.png";

  const mark = (
    <span
      className={`inline-flex items-center gap-2.5 shrink-0 bg-transparent ${className}`}
    >
      <Image
        src={src}
        alt="IndiRoute"
        width={dims.w}
        height={dims.h}
        className={`${dims.maxH} w-auto object-contain bg-transparent`}
        style={{ backgroundColor: "transparent", width: "auto", height: "auto" }}
        priority
      />
      {showWordmark ? (
        <span className="leading-tight">
          <span
            className={`${dims.text} font-bold tracking-tight ${
              variant === "light" ? "text-white" : "text-[color:var(--ink)]"
            }`}
          >
            Indi<span className="text-[color:var(--saffron)]">Route</span>
          </span>
          <span
            className={`block text-[10px] font-medium tracking-wide ${
              variant === "light" ? "text-white/70" : "text-[color:var(--muted)]"
            }`}
          >
            Shop India. Ship Worldwide.
          </span>
        </span>
      ) : null}
    </span>
  );

  if (!href) return mark;
  return (
    <Link href={href} className="inline-flex bg-transparent hover:opacity-95">
      {mark}
    </Link>
  );
}
