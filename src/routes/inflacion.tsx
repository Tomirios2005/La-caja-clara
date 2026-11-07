import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdSlot } from "@/components/ad-slot";
import { Shell } from "@/components/shell";
import { Kicker, MoneyRow, Note, NumberField, Panel } from "@/components/ui";
import { serieInflacion } from "@/lib/calc";
import { ipcHistoria, ipcReciente, type IpcLevel, type IpcPoint } from "@/lib/ipc.functions";
import { formatArs, parseMoney } from "@/lib/money";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/inflacion")({
  head: () =>
    pageHead({
      title: "Calculadora de inflación e IPC del INDEC — Caja Clara",
      description:
        "Mirá el IPC nacional del INDEC y calculá cuánta plata vas a necesitar, o cuánto vale un monto entre dos fechas.",
      path: "/inflacion",
      keywords: [
        "calculadora inflación",
        "IPC INDEC",
        "índice de precios",
        "poder de compra",
        "inflación mensual",
        "Argentina",
      ],
    }),
  component: InflacionPage,
});

function InflacionPage() {
  const [monto, setMonto] = useState("100000");
  const [mensual, setMensual] = useState("2");
  const [meses, setMeses] = useState("12");
  const [ready, setReady] = useState(false);
  const [ipc, setIpc] = useState<IpcPoint[]>([]);
  const [fuente, setFuente] = useState("");
  useEffect(() => setReady(true), []);
  useEffect(() => {
    let live = true;
    ipcReciente()
      .then((res) => {
        if (!live || !res.ok) return;
        setIpc(res.points);
        setFuente(res.source);
        const last = res.points[res.points.length - 1];
        if (last) setMensual(String(last.monthly).replace(".", ","));
      })
      .catch(() => {
        if (live) setIpc([]);
      });
    return () => {
      live = false;
    };
  }, []);
  const serie = useMemo(
    () => serieInflacion(parseMoney(monto), parseMoney(mensual), parseMoney(meses) || 1),
    [monto, mensual, meses],
  );
  const last = serie[serie.length - 1];

  return (
    <Shell>
      <article className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Kicker>Poder de compra</Kicker>
        <h1 className="mt-2 font-serif text-4xl leading-tight">La misma plata, más adelante</h1>
        <p className="mt-3 leading-relaxed text-muted">
          El ritmo inicial sale del último IPC nacional publicado por el INDEC. Después podés cambiarlo: sirve para un
          alquiler, un sueldo congelado o un presupuesto que cobrás en cuotas. Cómo se lee el índice está en{" "}
          <Link to="/guia/$slug" params={{ slug: "leer-el-ipc" }} className="text-brass">
            la guía del IPC
          </Link>
          .
        </p>
        {ipc.length > 0 ? (
          <Panel className="mt-6">
            <p className="text-sm font-medium">IPC nivel general, últimos meses</p>
            <ul className="mt-3 divide-y divide-line">
              {ipc.map((point) => (
                <li key={point.date} className="flex items-baseline justify-between gap-4 py-2 text-sm">
                  <span className="capitalize text-muted">{point.label}</span>
                  <span className="tabular-nums">
                    {point.monthly.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted">Fuente: {fuente}</p>
          </Panel>
        ) : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <NumberField label="Monto de hoy" value={monto} onChange={setMonto} />
          <NumberField label="Inflación mensual" suffix="%" value={mensual} onChange={setMensual} />
          <NumberField label="Meses" value={meses} onChange={setMeses} />
        </div>
        {last ? (
          <Panel className="mt-6">
            <MoneyRow label="Para comprar lo mismo" value={formatArs(last.necesario)} strong />
            <MoneyRow label="Lo que vale tu monto" value={formatArs(last.poder)} />
            <div className="mt-4 h-56 w-full">
              {ready ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={serie}>
                    <XAxis dataKey="mes" tick={{ fill: "#6f675e", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      formatter={(v, name) => [
                        formatArs(Number(v ?? 0)),
                        name === "necesario" ? "Necesitás" : "Poder de compra",
                      ]}
                      contentStyle={{
                        background: "#faf7f1",
                        border: "1px solid #e2d9cc",
                        borderRadius: 8,
                        color: "#1a1714",
                      }}
                    />
                    <Line type="monotone" dataKey="necesario" stroke="#9a6232" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </Panel>
        ) : null}
        <Note>Es interés compuesto mensual, parejo. La inflación real no es una línea recta.</Note>
        <Equivalencia />
        <div className="mt-8">
          <AdSlot slot={2} />
        </div>
      </article>
    </Shell>
  );
}

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function Equivalencia() {
  const [levels, setLevels] = useState<IpcLevel[]>([]);
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("100000");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    ipcHistoria()
      .then((res) => {
        if (!res.ok) return;
        setLevels(res.points);
        setSource(res.source);
        const last = res.points[res.points.length - 1];
        const yearAgo = res.points[Math.max(0, res.points.length - 13)];
        setFrom(yearAgo?.date ?? "");
        setTo(last?.date ?? "");
      })
      .catch(() => setLevels([]));
  }, []);

  const years = [...new Set(levels.map((point) => point.date.slice(0, 4)))];
  const fromPoint = levels.find((point) => point.date === from);
  const toPoint = levels.find((point) => point.date === to);
  const pesos = parseMoney(amount);
  const value = fromPoint && toPoint && fromPoint.index ? pesos * (toPoint.index / fromPoint.index) : 0;
  const pct = fromPoint && toPoint && fromPoint.index ? (toPoint.index / fromPoint.index - 1) * 100 : 0;

  function pick(current: string, year: string, month: string) {
    const exact = levels.find((point) => point.date.startsWith(`${year}-${month}`));
    if (exact) return exact.date;
    const inYear = levels.find((point) => point.date.startsWith(year));
    return inYear?.date ?? current;
  }

  return (
    <section className="mt-12 border-t border-line pt-10">
      <Kicker>IPC histórico</Kicker>
      <h2 className="mt-2 font-serif text-3xl leading-tight">Cuánto es esa plata en otra fecha</h2>
      <p className="mt-3 leading-relaxed text-muted">
        Elegí el mes de origen y el mes de llegada. El monto se convierte con el índice de precios del INDEC, desde
        diciembre de 2016.
      </p>
      {levels.length === 0 ? <p className="mt-4 text-sm text-muted">Cargando la serie…</p> : null}
      {levels.length > 0 ? (
        <>
          <div className="mt-6">
            <NumberField label="Monto" value={amount} onChange={setAmount} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <DateSelect
              label="Desde"
              years={years}
              levels={levels}
              value={from}
              onYear={(year) => setFrom((current) => pick(current, year, current.slice(5, 7)))}
              onMonth={(month) => setFrom((current) => pick(current, current.slice(0, 4), month))}
            />
            <DateSelect
              label="Hasta"
              years={years}
              levels={levels}
              value={to}
              onYear={(year) => setTo((current) => pick(current, year, current.slice(5, 7)))}
              onMonth={(month) => setTo((current) => pick(current, current.slice(0, 4), month))}
            />
          </div>
          {fromPoint && toPoint ? (
            <Panel className="mt-6">
              <MoneyRow
                label={`${formatArs(pesos)} de ${fromPoint.label} equivalen a`}
                value={formatArs(value)}
                strong
              />
              <p className="mt-3 text-sm text-muted">
                Variación del índice entre esas fechas:{" "}
                {pct.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">Fuente: {source}</p>
            </Panel>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function DateSelect({
  label,
  years,
  levels,
  value,
  onYear,
  onMonth,
}: {
  label: string;
  years: string[];
  levels: IpcLevel[];
  value: string;
  onYear: (year: string) => void;
  onMonth: (month: string) => void;
}) {
  const year = value.slice(0, 4);
  const month = value.slice(5, 7);
  const months = levels.filter((point) => point.date.startsWith(year));
  return (
    <fieldset>
      <legend className="text-sm">{label}</legend>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <select
          value={month}
          onChange={(e) => onMonth(e.target.value)}
          className="min-h-11 rounded-lg border border-line bg-surface px-3"
          aria-label={`${label}, mes`}
        >
          {months.map((point) => (
            <option key={point.date} value={point.date.slice(5, 7)}>
              {MONTH_NAMES[Number(point.date.slice(5, 7)) - 1]}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => onYear(e.target.value)}
          className="min-h-11 rounded-lg border border-line bg-surface px-3"
          aria-label={`${label}, año`}
        >
          {years.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}
