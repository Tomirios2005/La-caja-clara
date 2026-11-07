import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdSlot } from "@/components/ad-slot";
import { Shell } from "@/components/shell";
import { Kicker, MoneyRow, Note, NumberField, Panel } from "@/components/ui";
import { calcAlquiler } from "@/lib/calc";
import { formatArs, formatNum, parseMoney } from "@/lib/money";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/alquiler")({
  head: () =>
    pageHead({
      title: "Calculadora de aumento de alquiler — Caja Clara",
      description:
        "Calculá el próximo alquiler y qué porcentaje de tu sueldo neto se va en el contrato. Para inquilinos en Argentina.",
      path: "/alquiler",
      keywords: [
        "calculadora alquiler",
        "aumento de alquiler",
        "ajuste de alquiler",
        "porcentaje del sueldo",
        "alquiler e IPC",
        "Argentina",
      ],
    }),
  component: AlquilerPage,
});

function AlquilerPage() {
  const [actual, setActual] = useState("450000");
  const [pct, setPct] = useState("10");
  const [neto, setNeto] = useState("996000");
  const r = useMemo(
    () => calcAlquiler(parseMoney(actual), parseMoney(pct), parseMoney(neto)),
    [actual, pct, neto],
  );
  const tone = r.peso >= 40 ? "text-bad" : r.peso >= 30 ? "text-brass" : "text-good";

  return (
    <Shell>
      <article className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Kicker>Contrato</Kicker>
        <h1 className="mt-2 font-serif text-4xl leading-tight">Alquiler contra el sueldo</h1>
        <p className="mt-3 leading-relaxed text-muted">
          El porcentaje se mira sobre lo que cobrás en mano, no sobre el bruto. El 30% es una guía, no una ley.
        </p>
        <div className="mt-6 grid gap-4">
          <NumberField label="Alquiler de este mes" value={actual} onChange={setActual} />
          <NumberField label="Aumento" suffix="%" value={pct} onChange={setPct} />
          <NumberField
            label="Sueldo en mano"
            hint="Si no lo tenés, sacalo en la calculadora de sueldo."
            value={neto}
            onChange={setNeto}
          />
        </div>
        <Panel className="mt-6">
          <MoneyRow label="Próximo mes" value={formatArs(r.nuevo)} strong />
          <MoneyRow label="Diferencia" value={formatArs(r.diferencia)} />
          <p className={"mt-3 text-sm " + tone}>Se lleva el {formatNum(r.peso, 1)}% del neto.</p>
        </Panel>
        <Note>
          <Link to="/inflacion" className="text-brass">
            Mirá el mismo peso dentro de unos meses
          </Link>{" "}
          si el ajuste se repite y el sueldo no.
        </Note>
        <div className="mt-8">
          <AdSlot slot={0} />
        </div>
      </article>
    </Shell>
  );
}
