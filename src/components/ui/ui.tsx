import { type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const styles = {
    primary:
      "bg-[color:var(--orange)] text-white hover:bg-[color:var(--orange-hover)]",
    secondary:
      "bg-[color:var(--wash)] text-[color:var(--navy)] border border-[color:var(--line)] hover:bg-[color:var(--line)]",
    danger: "bg-red-700 text-white hover:bg-red-800",
    ghost: "bg-transparent text-[color:var(--ink-soft)] hover:bg-[color:var(--wash)]",
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-[4px] px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${styles[variant]} ${className}`}
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
      className={`w-full rounded-[4px] border border-[color:var(--line)] bg-white px-3 py-2.5 text-sm text-[color:var(--navy)] outline-none ring-[color:var(--orange)] focus:ring-2 ${className}`}
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
      className={`rounded-[8px] border border-[color:var(--line)] bg-white p-5 shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  );
}

export function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-[color:var(--navy)]">{title}</h1>
      {subtitle ? (
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--ink-soft)]">{subtitle}</p>
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
    <div className={`rounded-[8px] border px-3 py-2 text-sm ${map[tone]}`}>{children}</div>
  );
}
