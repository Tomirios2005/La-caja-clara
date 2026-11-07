import { useEffect, useState } from "react";

const KEY = "cajaclara.entitlements";
const RECEIPTS = "cajaclara.receipts";

export function readEntitlements(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function grantEntitlement(id: string) {
  const cur = new Set(readEntitlements());
  cur.add(id);
  if (id === "pro") {
    cur.add("presupuesto");
    cur.add("plan");
  }
  localStorage.setItem(KEY, JSON.stringify([...cur]));
  window.dispatchEvent(new Event("cajaclara-entitlements"));
}

export function rememberReceipt(productId: string, paymentId: string) {
  if (!productId || !paymentId) return;
  const cur = readReceipts().filter((row) => row.productId !== productId);
  cur.push({ productId, paymentId });
  localStorage.setItem(RECEIPTS, JSON.stringify(cur));
}

export function readReceipts(): { productId: string; paymentId: string }[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECEIPTS);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is { productId: string; paymentId: string } =>
        Boolean(row) &&
        typeof row === "object" &&
        typeof (row as { productId?: unknown }).productId === "string" &&
        typeof (row as { paymentId?: unknown }).paymentId === "string",
    );
  } catch {
    return [];
  }
}

export function useEntitlements() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setIds(readEntitlements());
    sync();
    window.addEventListener("cajaclara-entitlements", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cajaclara-entitlements", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const pro = ids.includes("pro");
  return {
    ids,
    pro,
    has: (id: string) => pro || ids.includes(id),
  };
}
