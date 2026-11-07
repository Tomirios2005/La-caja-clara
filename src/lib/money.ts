export function parseMoney(raw: string): number {
  const t = raw.trim().replace(/\s/g, "").replace(/\$/g, "");
  if (!t) return 0;
  const hasComma = t.includes(",");
  const hasDot = t.includes(".");
  let n = t;
  if (hasComma && hasDot) n = t.replace(/\./g, "").replace(",", ".");
  else if (hasComma) n = t.replace(",", ".");
  else if (hasDot && /^\d{1,3}(\.\d{3})+$/.test(t)) n = t.replace(/\./g, "");
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

export function formatArs(n: number, digits = 0): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(n) ? n : 0);
}

export function formatNum(n: number, digits = 0): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(n) ? n : 0);
}
