import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Button, Kicker } from "@/components/ui";
import { grantEntitlement, rememberReceipt } from "@/lib/entitlements";
import { normalizePaymentId, verifyPayment } from "@/lib/mp.functions";
import { getProduct } from "@/lib/products";

export const Route = createFileRoute("/pago")({
  validateSearch: (search: Record<string, unknown>) => ({
    payment_id: typeof search.payment_id === "string" ? search.payment_id : "",
    collection_id: typeof search.collection_id === "string" ? search.collection_id : "",
    merchant_order_id:
      typeof search.merchant_order_id === "string" ? search.merchant_order_id : "",
    status: typeof search.status === "string" ? search.status : "",
  }),
  head: () => ({
    meta: [{ title: "Pago — Caja Clara" }, { name: "robots", content: "noindex" }],
  }),
  component: PagoPage,
});

function PagoPage() {
  const search = Route.useSearch();
  const paymentId = normalizePaymentId(search.payment_id || search.collection_id);
  const merchantOrderId = normalizePaymentId(search.merchant_order_id);
  const hasReturnIds = Boolean(paymentId || merchantOrderId);
  const [manual, setManual] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState("");
  const [productId, setProductId] = useState("");

  useEffect(() => {
    if (!hasReturnIds) return;
    let cancel = false;
    setPhase("loading");
    verifyPayment({
      data: { paymentId, merchantOrderId },
    })
      .then((res) => {
        if (cancel) return;
        apply(res, paymentId || merchantOrderId);
      })
      .catch(() => {
        if (!cancel) {
          setPhase("done");
          setMessage("No se pudo verificar el pago.");
        }
      });
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasReturnIds, paymentId, merchantOrderId]);

  function apply(res: Awaited<ReturnType<typeof verifyPayment>>, receiptId = "") {
    setPhase("done");
    if (!res.ok) {
      setMessage(
        res.reason === "missing_token"
          ? "El servidor no tiene Mercado Pago conectado, así que no puede confirmar el pago."
          : res.reason === "not_found"
            ? "Mercado Pago no encuentra ese número."
            : res.detail || "No se pudo confirmar el pago.",
      );
      return;
    }
    setProductId(res.productId);
    if (res.unlocked) {
      grantEntitlement(res.productId);
      if (receiptId) rememberReceipt(res.productId, receiptId);
      setMessage(
        "Pago acreditado. La herramienta quedó abierta en este navegador. Si entraste con Google, también queda en tu cuenta.",
      );
      return;
    }
    if (res.status === "pending" || res.status === "in_process") {
      setMessage("El pago sigue pendiente. Cuando se acredite, volvé a pegar el número de operación.");
      return;
    }
    setMessage(`Mercado Pago marcó el pago como «${res.status}». Si se debitó, esperá un minuto y reintentá.`);
  }

  async function checkManual() {
    setPhase("loading");
    setMessage("");
    try {
      const digits = normalizePaymentId(manual);
      if (!digits) {
        setPhase("done");
        setMessage("El número no es válido.");
        return;
      }
      let res = await verifyPayment({ data: { paymentId: digits, merchantOrderId: "" } });
      if (!res.ok && res.reason === "not_found") {
        res = await verifyPayment({ data: { paymentId: "", merchantOrderId: digits } });
      }
      apply(res, digits);
    } catch {
      setPhase("done");
      setMessage("El número no es válido.");
    }
  }

  const product = getProduct(productId);

  return (
    <Shell>
      <section className="mx-auto max-w-xl px-4 py-10">
        <Kicker>Mercado Pago</Kicker>
        <h1 className="mt-2 font-serif text-4xl">Tu pago</h1>
        {phase === "loading" ? <p className="mt-4 text-muted">Confirmando con Mercado Pago…</p> : null}
        {message ? <p className="mt-4 leading-relaxed">{message}</p> : null}
        {product ? (
          <Link
            to="/producto/$slug"
            params={{ slug: product.id }}
            className="mt-4 inline-flex min-h-11 items-center text-brass"
          >
            Abrir {product.name}
          </Link>
        ) : null}
        <div className="mt-8 rounded-lg border border-line bg-surface p-4">
          <p className="text-sm">¿Ya pagaste y no volviste solo? Pegá el número de operación.</p>
          <input
            inputMode="numeric"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            className="mt-3 w-full rounded-lg border border-line bg-bg px-3 py-3 tabular-nums outline-none focus:border-brass"
            placeholder="1234567890"
          />
          <Button className="mt-3" onClick={checkManual} disabled={phase === "loading" || !manual.trim()}>
            Verificar pago
          </Button>
        </div>
      </section>
    </Shell>
  );
}
