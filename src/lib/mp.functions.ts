import { createServerFn } from "@tanstack/react-start";
import { addProduct, readSession } from "@/lib/account-store";
import { getProduct } from "@/lib/products";

function token() {
  const fromProcess =
    typeof process !== "undefined" ? process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() : "";
  if (fromProcess) return fromProcess;
  const bag = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const bound = bag?.MERCADOPAGO_ACCESS_TOKEN;
  return typeof bound === "string" ? bound.trim() : "";
}

/** Mercado Pago IDs are digits; users often paste spaces or labels from the app. */
export function normalizePaymentId(raw: string) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  return /^\d{1,20}$/.test(digits) ? digits : "";
}

function originOf(raw: string) {
  const u = new URL(raw);
  if (u.protocol !== "https:" && u.protocol !== "http:") {
    throw new Error("Origen inválido");
  }
  return u.origin;
}

export const mpStatus = createServerFn({ method: "GET" }).handler(async () => {
  const t = token();
  return {
    configured: Boolean(t),
    test: t.startsWith("TEST"),
  };
});

export const createCheckout = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Datos inválidos");
    const d = data as { productId?: unknown; origin?: unknown };
    if (typeof d.productId !== "string" || typeof d.origin !== "string") {
      throw new Error("Datos inválidos");
    }
    return { productId: d.productId, origin: originOf(d.origin) };
  })
  .handler(async ({ data }) => {
    const access = token();
    if (!access) return { ok: false as const, reason: "missing_token" as const, detail: "" };
    const product = getProduct(data.productId);
    if (!product) return { ok: false as const, reason: "unknown_product" as const, detail: "" };
    const back = `${data.origin}/pago`;
    const body = {
      items: [
        {
          id: product.id,
          title: `${product.name} — Caja Clara`,
          quantity: 1,
          currency_id: "ARS",
          unit_price: product.price,
        },
      ],
      back_urls: { success: back, pending: back, failure: back },
      auto_return: data.origin.startsWith("https:") ? "approved" : undefined,
      external_reference: product.id,
      statement_descriptor: "CAJA CLARA",
      binary_mode: false,
    };
    try {
      const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const json: { message?: string; init_point?: string; sandbox_init_point?: string; error?: string } =
        await res.json().catch(() => ({}));
      if (!res.ok || !json.init_point) {
        const detail = (json.message || json.error || "Mercado Pago rechazó el cobro").slice(0, 280);
        return { ok: false as const, reason: "mp_error" as const, detail };
      }
      const url = access.startsWith("TEST") && json.sandbox_init_point ? json.sandbox_init_point : json.init_point;
      return { ok: true as const, url };
    } catch {
      return {
        ok: false as const,
        reason: "mp_error" as const,
        detail: "No se pudo contactar a Mercado Pago.",
      };
    }
  });

type VerifyResult =
  | { ok: false; reason: string; detail: string; status: string; productId: string }
  | { ok: true; status: string; productId: string; unlocked: boolean };

async function fetchPaymentById(access: string, paymentId: string): Promise<VerifyResult | null> {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${access}` },
  });
  if (res.status === 404) return null;
  const json: {
    status?: string;
    external_reference?: string;
    transaction_amount?: number;
    message?: string;
  } = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false,
      reason: "mp_error",
      detail: (json.message || "No se pudo verificar el pago").slice(0, 280),
      status: "",
      productId: "",
    };
  }
  return interpretPayment(json);
}

async function fetchPaymentFromMerchantOrder(
  access: string,
  merchantOrderId: string,
): Promise<VerifyResult | null> {
  const res = await fetch(`https://api.mercadopago.com/merchant_orders/${merchantOrderId}`, {
    headers: { Authorization: `Bearer ${access}` },
  });
  if (res.status === 404) return null;
  const json: {
    status?: string;
    external_reference?: string;
    payments?: Array<{ id?: number | string; status?: string; transaction_amount?: number }>;
    message?: string;
  } = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false,
      reason: "mp_error",
      detail: (json.message || "No se pudo verificar el pago").slice(0, 280),
      status: "",
      productId: "",
    };
  }
  const payments = Array.isArray(json.payments) ? json.payments : [];
  const approved = payments.find((p) => p.status === "approved") ?? payments[0];
  if (!approved) {
    return {
      ok: false,
      reason: "not_found",
      detail: "La orden no tiene pagos asociados todavía.",
      status: json.status || "",
      productId: String(json.external_reference || ""),
    };
  }
  const paymentId = normalizePaymentId(String(approved.id ?? ""));
  if (paymentId) {
    const byPayment = await fetchPaymentById(access, paymentId);
    if (byPayment) return byPayment;
  }
  return interpretPayment({
    status: approved.status,
    external_reference: json.external_reference,
    transaction_amount: approved.transaction_amount,
  });
}

function interpretPayment(json: {
  status?: string;
  external_reference?: string;
  transaction_amount?: number;
}): VerifyResult {
  const productId = String(json.external_reference || "");
  const product = getProduct(productId);
  if (!product) {
    return {
      ok: false,
      reason: "unknown_product",
      detail: "",
      status: json.status || "",
      productId,
    };
  }
  const paid = Number(json.transaction_amount);
  if (json.status === "approved" && Math.abs(paid - product.price) > 1) {
    return {
      ok: false,
      reason: "amount_mismatch",
      detail: "",
      status: "approved",
      productId,
    };
  }
  return {
    ok: true,
    status: json.status || "unknown",
    productId,
    unlocked: json.status === "approved",
  };
}

async function confirmPayment(paymentId: string, merchantOrderId: string): Promise<VerifyResult> {
  const access = token();
  if (!access) return { ok: false, reason: "missing_token", detail: "", status: "", productId: "" };
  try {
    if (paymentId) {
      const direct = await fetchPaymentById(access, paymentId);
      if (direct) return direct;
    }
    if (merchantOrderId) {
      const fromOrder = await fetchPaymentFromMerchantOrder(access, merchantOrderId);
      if (fromOrder) return fromOrder;
    }
    return { ok: false, reason: "not_found", detail: "", status: "", productId: "" };
  } catch {
    return {
      ok: false,
      reason: "mp_error",
      detail: "No se pudo contactar a Mercado Pago.",
      status: "",
      productId: "",
    };
  }
}

async function saveForSession(productId: string) {
  const { getCookie } = await import("@tanstack/react-start/server");
  const session = await readSession(getCookie("cc_session") ?? "");
  if (!session || !productId) return false;
  await addProduct(session.sub, productId);
  return true;
}

export const verifyPayment = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Datos inválidos");
    const paymentId = normalizePaymentId(String((data as { paymentId?: unknown }).paymentId ?? ""));
    const merchantOrderId = normalizePaymentId(
      String((data as { merchantOrderId?: unknown }).merchantOrderId ?? ""),
    );
    if (!paymentId && !merchantOrderId) throw new Error("Número de pago inválido");
    return { paymentId, merchantOrderId };
  })
  .handler(async ({ data }) => {
    const result = await confirmPayment(data.paymentId, data.merchantOrderId);
    if (result.ok && result.unlocked) await saveForSession(result.productId);
    return result;
  });

export const claimReceipts = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Datos inválidos");
    const raw = (data as { paymentIds?: unknown }).paymentIds;
    const paymentIds = Array.isArray(raw)
      ? raw.map((id) => normalizePaymentId(String(id))).filter(Boolean).slice(0, 12)
      : [];
    return { paymentIds };
  })
  .handler(async ({ data }) => {
    const { getCookie } = await import("@tanstack/react-start/server");
    const session = await readSession(getCookie("cc_session") ?? "");
    if (!session) return { products: [] as string[] };
    for (const paymentId of data.paymentIds) {
      const res = await confirmPayment(paymentId, "");
      if (res.ok && res.unlocked && res.productId) await addProduct(session.sub, res.productId);
    }
    const fresh = await readSession(getCookie("cc_session") ?? "");
    return { products: fresh?.products ?? [] };
  });
