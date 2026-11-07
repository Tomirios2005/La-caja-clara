import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="text-xs font-medium uppercase tracking-widest text-brass">{children}</p>;
}

export function NumberField({
  label,
  hint,
  value,
  onChange,
  suffix,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs leading-relaxed text-muted">{hint}</span> : null}
      <span className="mt-1 flex items-center rounded-lg border border-line bg-surface focus-within:border-brass">
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-3 py-3 text-base outline-none tabular-nums"
        />
        {suffix ? <span className="pr-3 text-sm text-muted">{suffix}</span> : null}
      </span>
    </label>
  );
}

export function MoneyRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={"flex items-baseline justify-between gap-4 border-b border-line py-2.5 " + (strong ? "" : "")}>
      <span className={strong ? "font-medium" : "text-muted"}>{label}</span>
      <span className={"tabular-nums " + (strong ? "font-serif text-2xl" : "")}>{value}</span>
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={"rounded-lg border border-line bg-surface p-4 " + className}>{children}</div>;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const look =
    variant === "primary"
      ? "bg-brass text-brass-ink hover:opacity-90"
      : "border border-line bg-surface text-ink hover:border-brass";
  return (
    <button
      {...props}
      className={
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50 " +
        look +
        " " +
        className
      }
    />
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-xs leading-relaxed text-muted">{children}</p>;
}
