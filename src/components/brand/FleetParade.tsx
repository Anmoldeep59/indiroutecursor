import Image from "next/image";

export function FleetParade() {
  return (
    <section className="relative overflow-x-clip bg-[color:var(--navy-deep)] py-12 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(255,103,31,0.35), transparent 40%), radial-gradient(circle at 80% 30%, rgba(4,106,56,0.25), transparent 40%)",
        }}
      />
      <div className="relative mx-auto max-w-[1140px] px-4 md:px-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--saffron)]">
              Flag-branded fleet energy
            </p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              From Indian roads to global lanes
            </h2>
          </div>
          <p className="max-w-md text-sm text-white/70">
            Inspired by Indian truck art, saffron fleet colour, and real port corridors —
            animated for presence, not noise.
          </p>
        </div>

        <div className="fleet-track relative mt-10 h-40 overflow-hidden rounded-2xl border border-white/10 bg-black/20 sm:h-48">
          <div className="absolute inset-x-0 bottom-8 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="fleet-lane absolute inset-y-0 flex items-end gap-16 px-8 pb-6">
            <Image
              src="/brand/fleet/india-truck-art-lg.png"
              alt="Indian truck art"
              width={280}
              height={160}
              className="fleet-vehicle h-auto w-40 drop-shadow-xl sm:w-52"
              style={{ width: "auto", height: "auto" }}
            />
            <Image
              src="/brand/fleet/saffron-truck-lg.png"
              alt="Saffron IndiRoute-style fleet truck"
              width={320}
              height={160}
              className="fleet-vehicle h-auto w-48 drop-shadow-xl sm:w-64"
              style={{ width: "auto", height: "auto" }}
            />
            <Image
              src="/brand/fleet/india-truck-art-lg.png"
              alt=""
              width={280}
              height={160}
              className="fleet-vehicle h-auto w-40 opacity-80 drop-shadow-xl sm:w-52"
              style={{ width: "auto", height: "auto" }}
              aria-hidden
            />
            <Image
              src="/brand/fleet/saffron-truck-lg.png"
              alt=""
              width={320}
              height={160}
              className="fleet-vehicle h-auto w-48 opacity-80 drop-shadow-xl sm:w-64"
              style={{ width: "auto", height: "auto" }}
              aria-hidden
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Indian truck art", "Culture on the move"],
            ["Saffron fleet", "Brand-forward logistics"],
            ["Port corridors", "JNPT · DEL · BOM · MAA"],
          ].map(([t, d]) => (
            <div
              key={t}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
            >
              <p className="font-bold text-white">{t}</p>
              <p className="text-white/65">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
