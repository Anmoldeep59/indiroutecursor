import { type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "navy" | "green";
}) {
  const styles = {
    primary: "sp-btn-orange",
    navy: "sp-btn-navy",
    green: "sp-btn-green",
    secondary: "sp-btn-outline-navy !text-[15px] !py-2.5",
    danger:
      "!bg-red-700 !text-white hover:!bg-red-800 focus-visible:!bg-red-800 active:!bg-red-900",
    ghost:
      "!bg-transparent !text-[color:var(--ink-soft)] hover:!bg-[color:var(--wash)] hover:!text-[color:var(--ink)]",
  };
  return (
    <button
      className={`btn ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-[4px] border border-[color:var(--line)] bg-white px-3 py-2.5 text-sm text-[color:var(--ink)] outline-none ring-[color:var(--orange)] focus:ring-2 ${className}`}
      {...props}
    />
  );
}

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-[color:var(--muted)]"
    >
      {children}
    </label>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[8px] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 text-[color:var(--ink)] shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  );
}

export function PageTitle({
  title,
  subtitle,
  variant = "light",
}: {
  title: string;
  subtitle?: string;
  /** light = dark text on ivory; dark = white text on admin navy/zinc */
  variant?: "light" | "dark";
}) {
  const titleCls =
    variant === "dark" ? "text-white" : "text-[color:var(--ink)]";
  const subCls =
    variant === "dark" ? "text-zinc-300" : "text-[color:var(--ink-soft)]";
  return (
    <div className="mb-6 max-w-full">
      <h1 className={`ir-headline text-2xl font-bold sm:text-3xl ${titleCls}`}>
        {title}
      </h1>
      {subtitle ? (
        <p className={`mt-2 max-w-2xl text-sm ${subCls}`}>{subtitle}</p>
      ) : null}
    </div>
  );
}

export function Alert({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "warn" | "danger" | "success";
}) {
  const map = {
    info: "border-[#507dbc]/40 bg-[color:var(--blue-soft)] text-[color:var(--navy)]",
    warn: "border-amber-200 bg-[#fff4d6] text-amber-950",
    danger: "border-red-200 bg-red-50 text-red-950",
    success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  };
  return (
    <div className={`rounded-[8px] border px-3 py-2 text-sm ${map[tone]}`}>
      {children}
    </div>
  );
}
