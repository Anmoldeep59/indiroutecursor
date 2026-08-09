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
      "bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent-deep)]",
    secondary:
      "bg-[color:var(--wash)] text-[color:var(--ink)] hover:bg-[color:var(--line)]",
    danger: "bg-red-700 text-white hover:bg-red-800",
    ghost: "bg-transparent text-[color:var(--ink-soft)] hover:bg-[color:var(--wash)]",
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${styles[variant]} ${className}`}
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
      className={`w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm text-[color:var(--ink)] outline-none ring-[color:var(--accent)] focus:ring-2 ${className}`}
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
      className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--muted)]"
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
      className={`rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-[0_1px_0_rgba(20,40,34,0.04)] ${className}`}
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
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[color:var(--ink)]">
        {title}
      </h1>
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
    info: "border-sky-200 bg-sky-50 text-sky-950",
    warn: "border-amber-200 bg-amber-50 text-amber-950",
    danger: "border-red-200 bg-red-50 text-red-950",
    success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  };
  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${map[tone]}`}>{children}</div>
  );
}
