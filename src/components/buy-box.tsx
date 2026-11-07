import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { useEntitlements } from "@/lib/entitlements";
import { formatArs } from "@/lib/money";
import { createCheckout, mpStatus } from "@/lib/mp.functions";
import type { Product } from "@/lib/products";

export function BuyBox({ product }: { product: Product }) {
  const { has } = useEntitlements();
  const owned = has(product.id);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancel = false;
    mpStatus()
      .then((s) => {
        if (!cancel) setConfigured(s.configured);
      })
      .catch(() => {
        if (!cancel) setConfigured(false);
      });
    return () => {
      cancel = true;
    };
  }, []);

  async function pay() {
    setBusy(true);
    setError("");
    try {
      const res = await createCheckout({
        data: { productId: product.id, origin: window.location.origin },
      });
      if (!res.ok) {
        setError(
          res.reason === "missing_token"
            ? "Mercado Pago todavía no está conectado en el servidor."
            : res.detail || "No se pudo abrir el pago.",
        );
        setBusy(false);
        return;
      }
      window.location.href = res.url;
    } catch {
      setError("No se pudo abrir el pago.");
      setBusy(false);
    }
  }

  return (
    <div className="no-print rounded-lg border border-line bg-surface p-4">
      <p className="text-xs uppercase tracking-widest text-muted">Pago único</p>
      <p className="mt-1 font-serif text-3xl tabular-nums">{formatArs(product.price)}</p>
      <ul className="mt-3 space-y-1 text-sm text-muted">
        {product.includes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {owned ? (
        <p className="mt-4 text-sm text-good">Listo en este navegador. Ya podés usar la versión limpia.</p>
      ) : (
        <Button className="mt-4 w-full" onClick={pay} disabled={busy || configured !== true}>
          {busy ? "Abriendo Mercado Pago…" : configured === null ? "Revisando Mercado Pago…" : "Pagar con Mercado Pago"}
        </Button>
      )}
      {configured === false && !owned ? (
        <p className="mt-3 text-xs leading-relaxed text-muted">
          El cobro real se prende con tu Access Token en el hosting. Mientras tanto podés probar la herramienta: la
          descarga limpia queda para después del pago.{" "}
          <Link to="/legal" className="text-brass">
            Aviso y fuentes
          </Link>
          .
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}
    </div>
  );
}
