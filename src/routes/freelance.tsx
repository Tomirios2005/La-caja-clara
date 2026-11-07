import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdSlot } from "@/components/ad-slot";
import { Shell } from "@/components/shell";
import { Kicker, MoneyRow, Note, NumberField, Panel } from "@/components/ui";
import { formatArs, formatNum, parseMoney } from "@/lib/money";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/freelance")({
  head: () =>
    pageHead({
      title: "Calculadora de tarifa por hora freelance — Caja Clara",
      description:
        "Calculá cuánto cobrar la hora para llegar a un neto, después de la cuota de monotributo y de las horas que no se facturan.",
      path: "/freelance",
      keywords: [
        "tarifa por hora",
        "cuánto cobrar por hora",
        "freelance Argentina",
        "precio hora monotributo",
        "tarifa freelancer",
      ],
    }),
  component: FreelancePage,
});

function FreelancePage() {
  const [neto, setNeto] = useState("900000");
  const [cuota, setCuota] = useState("56379");
  const [otros, setOtros] = useState("40000");
  const [horas, setHoras] = useState("35");
  const [admin, setAdmin] = useState("25");
  const [proyecto, setProyecto] = useState("40");
  const [dolar, setDolar] = useState("");

  const r = useMemo(() => {
    const semana = Math.max(0, parseMoney(horas));
    const utiles = semana * 4.33 * (1 - Math.min(90, Math.max(0, parseMoney(admin))) / 100);
    const necesidad = Math.max(0, parseMoney(neto)) + Math.max(0, parseMoney(cuota)) + Math.max(0, parseMoney(otros));
    const hora = utiles > 0 ? necesidad / utiles : 0;
    const job = hora * Math.max(0, parseMoney(proyecto));
    const usd = parseMoney(dolar);
    return { utiles, necesidad, hora, job, usd: usd > 0 ? hora / usd : 0 };
  }, [neto, cuota, otros, horas, admin, proyecto, dolar]);

  return (
    <Shell>
      <article className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-[minmax(0,1fr)_18rem] md:px-6">
        <div>
          <Kicker>Por tu cuenta</Kicker>
          <h1 className="mt-2 font-serif text-4xl leading-tight">La hora que te cierra</h1>
          <p className="mt-3 max-w-xl leading-relaxed text-muted">
            Sumá lo que querés en el banco, la cuota y los gastos fijos. Dividilo solo por las horas que de verdad
            facturás.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <NumberField label="Neto que querés por mes" value={neto} onChange={setNeto} />
            <NumberField label="Cuota del monotributo" value={cuota} onChange={setCuota} />
            <NumberField label="Otros gastos fijos" hint="Herramientas, internet, contador." value={otros} onChange={setOtros} />
            <NumberField label="Horas que trabajás por semana" value={horas} onChange={setHoras} />
            <NumberField label="Horas que no se cobran" suffix="%" value={admin} onChange={setAdmin} />
            <NumberField label="Horas de un proyecto" value={proyecto} onChange={setProyecto} />
            <NumberField label="Dólar que usás" hint="Opcional. Oficial, MEP o el que le pases al cliente." value={dolar} onChange={setDolar} />
          </div>
          <Panel className="mt-6">
            <MoneyRow label="Horas facturables por mes" value={formatNum(r.utiles, 1)} />
            <MoneyRow label="Tenés que facturar" value={formatArs(r.necesidad)} />
            <MoneyRow label="Tarifa hora" value={formatArs(r.hora)} strong />
            <MoneyRow label="Ese proyecto" value={formatArs(r.job)} />
            {r.usd > 0 ? <MoneyRow label="Hora en dólares" value={`US$ ${formatNum(r.usd, 2)}`} /> : null}
          </Panel>
          <Note>
            <Link to="/monotributo" className="text-brass">
              Categoría y cuota
            </Link>
            {" · "}
            <Link to="/producto/$slug" params={{ slug: "presupuesto" }} className="text-brass">
              Pasalo a un presupuesto
            </Link>
          </Note>
          <div className="mt-8">
            <AdSlot slot={0} />
          </div>
        </div>
        <aside>
          <AdSlot slot={2} />
        </aside>
      </article>
    </Shell>
  );
}
