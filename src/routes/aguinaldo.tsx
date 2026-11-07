import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdSlot } from "@/components/ad-slot";
import { Shell } from "@/components/shell";
import { Kicker, MoneyRow, Note, NumberField, Panel } from "@/components/ui";
import { calcAguinaldo } from "@/lib/calc";
import { formatArs, parseMoney } from "@/lib/money";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/aguinaldo")({
  head: () =>
    pageHead({
      title: "Calculadora de aguinaldo y SAC — Caja Clara",
      description:
        "Calculá el sueldo anual complementario: medio mejor sueldo del semestre, proporcional a los meses, en bruto y en mano.",
      path: "/aguinaldo",
      keywords: [
        "calculadora aguinaldo",
        "SAC",
        "sueldo anual complementario",
        "aguinaldo neto",
        "medio aguinaldo",
        "Argentina",
      ],
    }),
  component: AguinaldoPage,
});

function AguinaldoPage() {
  const [mejor, setMejor] = useState("1200000");
  const [meses, setMeses] = useState("6");
  const r = useMemo(() => calcAguinaldo(parseMoney(mejor), parseMoney(meses)), [mejor, meses]);

  return (
    <Shell>
      <article className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Kicker>SAC</Kicker>
        <h1 className="mt-2 font-serif text-4xl leading-tight">Aguinaldo</h1>
        <p className="mt-3 leading-relaxed text-muted">
          Es la mitad del mejor sueldo bruto del semestre. Si no trabajaste los seis meses, se prorratea. Después se le
          aplican los mismos aportes que a un sueldo.
        </p>
        <div className="mt-6 grid gap-4">
          <NumberField label="Mejor bruto del semestre" value={mejor} onChange={setMejor} />
          <label className="block text-sm">
            Meses trabajados en el semestre
            <select
              value={meses}
              onChange={(e) => setMeses(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-3"
            >
              {["1", "2", "3", "4", "5", "6"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Panel className="mt-6">
          <MoneyRow label="Aguinaldo bruto" value={formatArs(r.bruto)} />
          <MoneyRow label="Aportes" value={formatArs(r.descuentos)} />
          <MoneyRow label="En mano" value={formatArs(r.neto)} strong />
        </Panel>
        <Note>
          Sin sindicato y sin Ganancias. Si tu recibo de junio o diciembre trae otra retención, el depósito va a ser
          menor. <Link to="/sueldo" className="text-brass">Volver al sueldo mensual</Link>.
        </Note>
        <div className="mt-8">
          <AdSlot slot={1} />
        </div>
      </article>
    </Shell>
  );
}
