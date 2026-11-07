import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdSlot } from "@/components/ad-slot";
import { Shell } from "@/components/shell";
import { Kicker, Note, NumberField, Panel } from "@/components/ui";
import { calcSueldo } from "@/lib/calc";
import { formatArs, formatNum, parseMoney } from "@/lib/money";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/comparar")({
  head: () =>
    pageHead({
      title: "Comparar dos ofertas de trabajo en mano — Caja Clara",
      description:
        "Compará dos sueldos brutos ya pasados a neto y descontá el viaje, para ver cuál oferta deja más por hora.",
      path: "/comparar",
      keywords: [
        "comparar ofertas de trabajo",
        "sueldo en mano",
        "cuál trabajo conviene",
        "sueldo neto por hora",
        "Argentina",
      ],
    }),
  component: CompararPage,
});

function Offer({
  name,
  bruto,
  setBruto,
  horas,
  setHoras,
  viaje,
  setViaje,
}: {
  name: string;
  bruto: string;
  setBruto: (v: string) => void;
  horas: string;
  setHoras: (v: string) => void;
  viaje: string;
  setViaje: (v: string) => void;
}) {
  const r = useMemo(() => {
    const s = calcSueldo({
      bruto: parseMoney(bruto),
      sindicato: false,
      sindicatoPct: 0,
      noRemunerativo: 0,
    });
    const h = Math.max(1, parseMoney(horas));
    const pocket = s.neto - Math.max(0, parseMoney(viaje));
    return { neto: s.neto, pocket, hora: pocket / h };
  }, [bruto, horas, viaje]);

  return (
    <Panel>
      <h2 className="font-serif text-2xl">{name}</h2>
      <div className="mt-3 grid gap-3">
        <NumberField label="Bruto" value={bruto} onChange={setBruto} />
        <NumberField label="Horas por mes" value={horas} onChange={setHoras} />
        <NumberField label="Viaje y viandas" hint="Lo que gastás para ir y no te reintegran." value={viaje} onChange={setViaje} />
      </div>
      <p className="mt-4 text-sm text-muted">En mano</p>
      <p className="font-serif text-3xl tabular-nums">{formatArs(r.neto)}</p>
      <p className="mt-2 text-sm text-muted">Después del viaje: {formatArs(r.pocket)}</p>
      <p className="text-sm text-muted">Por hora: {formatArs(r.hora)}</p>
    </Panel>
  );
}

function CompararPage() {
  const [aB, setAB] = useState("1100000");
  const [aH, setAH] = useState("160");
  const [aV, setAV] = useState("80000");
  const [bB, setBB] = useState("1300000");
  const [bH, setBH] = useState("180");
  const [bV, setBV] = useState("150000");

  const a = calcSueldo({ bruto: parseMoney(aB), sindicato: false, sindicatoPct: 0, noRemunerativo: 0 });
  const b = calcSueldo({ bruto: parseMoney(bB), sindicato: false, sindicatoPct: 0, noRemunerativo: 0 });
  const aPocket = a.neto - Math.max(0, parseMoney(aV));
  const bPocket = b.neto - Math.max(0, parseMoney(bV));
  const aHora = aPocket / Math.max(1, parseMoney(aH));
  const bHora = bPocket / Math.max(1, parseMoney(bH));
  const winner = aHora === bHora ? "Empatan por hora." : aHora > bHora ? "La oferta A deja más por hora." : "La oferta B deja más por hora.";
  const gap = Math.abs(aPocket - bPocket);

  return (
    <Shell>
      <article className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <Kicker>Dos recibos</Kicker>
        <h1 className="mt-2 font-serif text-4xl leading-tight">Qué oferta conviene</h1>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          El bruto más alto no siempre gana. Acá se mira el neto y se resta lo que te cuesta ir a trabajar.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Offer name="Oferta A" bruto={aB} setBruto={setAB} horas={aH} setHoras={setAH} viaje={aV} setViaje={setAV} />
          <Offer name="Oferta B" bruto={bB} setBruto={setBB} horas={bH} setHoras={setBH} viaje={bV} setViaje={setBV} />
        </div>
        <Panel className="mt-4">
          <p className="font-serif text-2xl">{winner}</p>
          <p className="mt-1 text-sm text-muted">
            Diferencia en el bolsillo: {formatArs(gap)} por mes. A paga {formatArs(aHora)} la hora; B,{" "}
            {formatArs(bHora)}.
          </p>
          <p className="mt-2 text-sm text-muted">
            Horas de referencia: A {formatNum(parseMoney(aH), 0)}, B {formatNum(parseMoney(bH), 0)}. Sin sindicato ni
            Ganancias.
          </p>
        </Panel>
        <Note>Una hora de más o un colectivo más caro cambia el resultado. Cargá los números de tu semana real.</Note>
        <div className="mt-8">
          <AdSlot slot={1} />
        </div>
      </article>
    </Shell>
  );
}
