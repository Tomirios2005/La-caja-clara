import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdSlot } from "@/components/ad-slot";
import { Shell } from "@/components/shell";
import { Kicker, MoneyRow, Note, NumberField, Panel } from "@/components/ui";
import { useRatesRevision } from "@/components/rates-live";
import { categoriaMonotributo } from "@/lib/calc";
import { formatArs, parseMoney } from "@/lib/money";
import { MONOTRIBUTO, RATES } from "@/lib/rates";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/monotributo")({
  head: () =>
    pageHead({
      title: "Calculadora de monotributo: categoría y cuota — Caja Clara",
      description:
        "Ubicá tu categoría de monotributo según la facturación de los últimos 12 meses y mirá la cuota del cuadro vigente de ARCA.",
      path: "/monotributo",
      keywords: [
        "calculadora monotributo",
        "categorías monotributo",
        "cuota monotributo",
        "monotributo 2026",
        "ARCA",
        "facturación anual",
        "Argentina",
      ],
    }),
  component: MonoPage,
});

function MonoPage() {
  const revision = useRatesRevision();
  const [anual, setAnual] = useState("18000000");
  const [actividad, setActividad] = useState<"servicios" | "bienes">("servicios");
  const r = useMemo(() => categoriaMonotributo(parseMoney(anual), actividad), [anual, actividad, revision]);

  return (
    <Shell>
      <article className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Kicker>ARCA · desde el {RATES.monoVigencia}</Kicker>
        <h1 className="mt-2 font-serif text-4xl leading-tight">Categoría y cuota</h1>
        <p className="mt-3 leading-relaxed text-muted">
          Se mira la facturación de los últimos 12 meses. La cuota de la tabla incluye impuesto, obra social y aporte
          jubilatorio. Si estás exceptuado de alguno, vas a pagar menos.
        </p>
        <div className="mt-6 grid gap-4">
          <NumberField label="Facturación últimos 12 meses" value={anual} onChange={setAnual} />
          <div className="grid grid-cols-2 gap-2">
            {(["servicios", "bienes"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActividad(key)}
                className={
                  "min-h-11 rounded-lg border px-3 text-sm " +
                  (actividad === key ? "border-ink bg-ink text-bg" : "border-line bg-surface")
                }
              >
                {key === "servicios" ? "Servicios" : "Venta de cosas"}
              </button>
            ))}
          </div>
        </div>
        <Panel className="mt-6">
          {!r ? <p className="text-muted">Cargá un monto.</p> : null}
          {r && r.fuera ? (
            <p>
              Con {formatArs(r.anual, 2)} te pasás del tope de la categoría K ({formatArs(MONOTRIBUTO[10]!.tope, 2)}). Eso
              es responsable inscripto, no monotributo.
            </p>
          ) : null}
          {r && !r.fuera ? (
            <>
              <p className="text-sm text-muted">Tu categoría</p>
              <p className="font-serif text-5xl">{r.cat}</p>
              <MoneyRow label="Cuota de este mes" value={formatArs(r.cuota, 2)} strong />
              <MoneyRow label="Margen hasta el tope" value={formatArs(r.margen, 2)} />
            </>
          ) : null}
        </Panel>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="py-2 font-medium">Cat.</th>
                <th className="py-2 font-medium">Tope anual</th>
                <th className="py-2 font-medium">Servicios</th>
                <th className="py-2 font-medium">Bienes</th>
              </tr>
            </thead>
            <tbody>
              {MONOTRIBUTO.map((c) => (
                <tr key={c.cat} className="border-b border-line">
                  <td className="py-2">{c.cat}</td>
                  <td className="py-2 tabular-nums">{formatArs(c.tope)}</td>
                  <td className="py-2 tabular-nums">{formatArs(c.servicios)}</td>
                  <td className="py-2 tabular-nums">{formatArs(c.bienes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note>
          Cuadro oficial de ARCA, vigente desde el {RATES.monoVigencia}. Confirmalo antes de pagar la cuota.{" "}
          <Link to="/freelance" className="text-brass">
            Pasá la cuota a una tarifa por hora
          </Link>
          .
        </Note>
        <div className="mt-8">
          <AdSlot slot={1} />
        </div>
      </article>
    </Shell>
  );
}
