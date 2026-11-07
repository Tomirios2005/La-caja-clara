import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdSlot } from "@/components/ad-slot";
import { Shell } from "@/components/shell";
import { Button, Kicker, MoneyRow, Note, NumberField, Panel } from "@/components/ui";
import { useRatesRevision } from "@/components/rates-live";
import { calcSueldo } from "@/lib/calc";
import { formatArs, formatNum, parseMoney } from "@/lib/money";
import { RATES } from "@/lib/rates";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/sueldo")({
  head: () =>
    pageHead({
      title: "Calculadora de sueldo neto 2026 — Caja Clara",
      description:
        "Pasá el sueldo bruto a neto con jubilación, PAMI y obra social. Estimación del recibo de sueldo en Argentina, sin descontar Ganancias.",
      path: "/sueldo",
      keywords: [
        "calculadora sueldo neto",
        "sueldo bruto a neto",
        "recibo de sueldo",
        "jubilación",
        "obra social",
        "PAMI",
        "sueldo en mano",
        "Argentina 2026",
      ],
    }),
  component: SueldoPage,
});

function SueldoPage() {
  const revision = useRatesRevision();
  const [bruto, setBruto] = useState("1200000");
  const [extra, setExtra] = useState("0");
  const [sind, setSind] = useState(false);
  const [sindPct, setSindPct] = useState("2");
  const [copied, setCopied] = useState(false);
  const r = useMemo(
    () =>
      calcSueldo({
        bruto: parseMoney(bruto),
        noRemunerativo: parseMoney(extra),
        sindicato: sind,
        sindicatoPct: parseMoney(sindPct) / 100,
      }),
    [bruto, extra, sind, sindPct, revision],
  );

  async function copy() {
    const text = `Bruto ${formatArs(r.bruto)} → neto ${formatArs(r.neto)} (Caja Clara, estimación ${RATES.vigencia})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Shell>
      <article className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-[minmax(0,1fr)_18rem] md:px-6">
        <div>
          <Kicker>Relación de dependencia</Kicker>
          <h1 className="mt-2 font-serif text-4xl leading-tight">Sueldo en mano</h1>
          <p className="mt-3 max-w-xl leading-relaxed text-muted">
            Jubilación {formatNum(RATES.jubilacion * 100)}%, PAMI {formatNum(RATES.pami * 100)}% y obra social{" "}
            {formatNum(RATES.obraSocial * 100)}%, con tope de base imponible. No descuenta Ganancias.
          </p>
          <div className="mt-6 grid gap-4">
            <NumberField label="Sueldo bruto" value={bruto} onChange={setBruto} />
            <NumberField
              label="No remunerativo"
              hint="Presentismo u otro ítem que en tu recibo no aporta. Si no estás seguro, dejalo en 0."
              value={extra}
              onChange={setExtra}
            />
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" checked={sind} onChange={(e) => setSind(e.target.checked)} />
              Descontar cuota sindical
            </label>
            {sind ? (
              <NumberField label="Porcentaje del gremio" suffix="%" value={sindPct} onChange={setSindPct} />
            ) : null}
          </div>
          <Panel className="mt-6">
            <MoneyRow label="Jubilación" value={formatArs(r.jubilacion)} />
            <MoneyRow label="PAMI" value={formatArs(r.pami)} />
            <MoneyRow label="Obra social" value={formatArs(r.obraSocial)} />
            {sind ? <MoneyRow label="Sindicato" value={formatArs(r.sindicato)} /> : null}
            <MoneyRow label="Te queda" value={formatArs(r.neto)} strong />
          </Panel>
          {r.bajoSmvm ? (
            <p className="mt-3 text-sm text-bad">
              Está debajo del SMVM de {RATES.vigencia} ({formatArs(RATES.smvm)}).
            </p>
          ) : null}
          {r.topeAplicado ? (
            <p className="mt-3 text-sm text-muted">
              Los aportes se calcularon hasta la base máxima de referencia ({formatArs(RATES.baseMax)}), no sobre todo el
              bruto.
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="ghost" onClick={copy}>
              {copied ? "Copiado" : "Copiar resultado"}
            </Button>
            <Link to="/comparar" className="inline-flex min-h-11 items-center px-2 text-sm text-brass">
              Comparar con otra oferta
            </Link>
          </div>
          <Note>
            Tu empleador, aparte, pone cerca del {formatNum(RATES.contribucionPatronalResto * 100)}% al{" "}
            {formatNum(RATES.contribucionPatronalAlta * 100)}% de contribuciones. En un bruto de {formatArs(r.bruto)} el
            costo empresa ronda {formatArs(r.costoEmpresa)} si toma la alícuota alta. Eso no sale de tu neto.{" "}
            <Link to="/freelance" className="text-brass">
              Mirá la tarifa freelance
            </Link>
            .
          </Note>
          <div className="mt-8">
            <AdSlot slot={1} />
          </div>
        </div>
        <aside className="space-y-4">
          <Panel>
            <p className="font-serif text-xl">De este mes</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              SMVM {formatArs(RATES.smvm)} ({formatArs(RATES.horaSmvm)} la hora). Base imponible máxima de referencia{" "}
              {formatArs(RATES.baseMax)}.
            </p>
          </Panel>
          <AdSlot slot={2} />
        </aside>
      </article>
    </Shell>
  );
}
