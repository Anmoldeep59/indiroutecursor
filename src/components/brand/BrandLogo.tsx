import Image from "next/image";
import Link from "next/link";

export function BrandLogo({
  href = "/",
  variant = "light",
  showWordmark = true,
  size = "md",
}: {
  href?: string;
  variant?: "light" | "dark";
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dims = {
    sm: { box: 36, text: "text-lg" },
    md: { box: 44, text: "text-xl" },
    lg: { box: 56, text: "text-2xl" },
  }[size];

  return (
    <Link href={href} className="flex items-center gap-2.5 shrink-0">
      <Image
        src="/brand/indiroute-logo.png"
        alt="IndiRoute"
        width={dims.box}
        height={dims.box}
        className="object-contain"
        priority
      />
      {showWordmark ? (
        <span className="leading-tight">
          <span
            className={`${dims.text} font-bold tracking-tight ${
              variant === "light" ? "text-white" : "text-[color:var(--navy)]"
            }`}
          >
            Indi<span className="text-[color:var(--orange)]">Route</span>
          </span>
          <span
            className={`block text-[10px] font-medium tracking-wide ${
              variant === "light" ? "text-[#8ec5ff]" : "text-[color:var(--muted)]"
            }`}
          >
            Shop India. Ship Worldwide.
          </span>
        </span>
      ) : null}
    </Link>
  );
}
