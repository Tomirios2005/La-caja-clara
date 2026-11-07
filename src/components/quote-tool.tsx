import { useMemo, useState } from "react";
import { Button, Note, NumberField } from "@/components/ui";
import { formatArs, parseMoney } from "@/lib/money";

type Item = { desc: string; qty: string; price: string };

const EMPTY: Item = { desc: "", qty: "1", price: "" };

export function QuoteTool({ unlocked }: { unlocked: boolean }) {
  const [studio, setStudio] = useState("");
  const [cuit, setCuit] = useState("");
  const [client, setClient] = useState("");
  const [job, setJob] = useState("");
  const [days, setDays] = useState("15");
  const [notes, setNotes] = useState("El trabajo empieza con la seña del 50%.");
  const [items, setItems] = useState<Item[]>([{ desc: "Desarrollo del sitio", qty: "1", price: "350000" }]);
  const issued = useMemo(
    () => new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" }).format(new Date()),
    [],
  );

  const rows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        qtyN: Math.max(0, parseMoney(item.qty) || 0),
        priceN: Math.max(0, parseMoney(item.price)),
        total: Math.max(0, parseMoney(item.qty) || 0) * Math.max(0, parseMoney(item.price)),
      })),
    [items],
  );
  const grand = rows.reduce((s, r) => s + r.total, 0);

  function patch(i: number, partial: Partial<Item>) {
    setItems((prev) => prev.map((row, idx) => (idx === i ? { ...row, ...partial } : row)));
  }

  return (
    <div className="space-y-4">
      <div className="no-print grid gap-3">
        <label className="block text-sm">
          Tu nombre o estudio
          <input
            value={studio}
            onChange={(e) => setStudio(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-3 outline-none focus:border-brass"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            CUIT (opcional)
            <input
              value={cuit}
              onChange={(e) => setCuit(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-3 outline-none focus:border-brass"
            />
          </label>
          <label className="block text-sm">
            Cliente
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-3 outline-none focus:border-brass"
            />
          </label>
        </div>
        <label className="block text-sm">
          Trabajo
          <input
            value={job}
            onChange={(e) => setJob(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-3 outline-none focus:border-brass"
          />
        </label>
        {items.map((item, i) => (
          <div key={i} className="grid gap-2 rounded-lg border border-line p-3 sm:grid-cols-[1fr_5rem_8rem_auto]">
            <label className="text-xs text-muted">
              Ítem
              <input
                value={item.desc}
                onChange={(e) => patch(i, { desc: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-3 text-sm text-ink outline-none"
              />
            </label>
            <label className="text-xs text-muted">
              Cant.
              <input
                inputMode="decimal"
                value={item.qty}
                onChange={(e) => patch(i, { qty: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-3 text-sm text-ink outline-none tabular-nums"
              />
            </label>
            <label className="text-xs text-muted">
              Precio
              <input
                inputMode="decimal"
                value={item.price}
                onChange={(e) => patch(i, { price: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-3 text-sm text-ink outline-none tabular-nums"
              />
            </label>
            <button
              type="button"
              className="min-h-11 self-end px-2 text-sm text-muted"
              onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          type="button"
          className="min-h-11 text-left text-sm text-brass"
          onClick={() => setItems((prev) => [...prev, { ...EMPTY }])}
        >
          Sumar ítem
        </button>
        <NumberField label="Validez" suffix="días" value={days} onChange={setDays} />
        <label className="block text-sm">
          Condiciones
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-3 outline-none focus:border-brass"
          />
        </label>
      </div>

      <article className="print-sheet bg-surface px-6 py-7 text-ink sm:px-8" data-watermark={unlocked ? "0" : "1"}>
        <header className="flex items-start justify-between gap-6 border-b-2 border-ink pb-4">
          <div>
            <p className="text-xs font-medium tracking-widest">PRESUPUESTO</p>
            <h2 className="mt-2 font-serif text-3xl leading-none">{studio || "Tu nombre"}</h2>
            {cuit ? <p className="mt-2 text-sm">CUIT {cuit}</p> : null}
          </div>
          <div className="text-right text-sm">
            <p>{issued}</p>
            <p className="mt-1 text-muted">Válido {days || "0"} días</p>
          </div>
        </header>
        <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium tracking-widest text-muted">PARA</p>
            <p className="mt-1 text-lg font-medium">{client || "Cliente"}</p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-widest text-muted">TRABAJO</p>
            <p className="mt-1">{job || "Sin detalle"}</p>
          </div>
        </div>
        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink text-left">
              <th className="py-2 font-medium">Detalle</th>
              <th className="w-16 py-2 text-right font-medium">Cant.</th>
              <th className="w-28 py-2 text-right font-medium">Precio</th>
              <th className="w-32 py-2 text-right font-medium">Importe</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-line">
                <td className="py-2.5 pr-3">{row.desc || "Ítem"}</td>
                <td className="py-2.5 text-right tabular-nums">{row.qty || "0"}</td>
                <td className="py-2.5 text-right tabular-nums">{formatArs(row.priceN)}</td>
                <td className="py-2.5 text-right tabular-nums">{formatArs(row.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-end">
          <div className="flex w-full max-w-xs items-baseline justify-between gap-6 border-t-2 border-ink pt-3">
            <span className="text-sm font-medium tracking-widest">TOTAL</span>
            <span className="font-serif text-3xl tabular-nums">{formatArs(grand)}</span>
          </div>
        </div>
        {notes ? <p className="mt-8 max-w-prose text-sm leading-relaxed">{notes}</p> : null}
      </article>

      <div className="no-print flex flex-wrap gap-2">
        <Button onClick={() => window.print()} disabled={!unlocked}>
          Imprimir o guardar PDF
        </Button>
        {!unlocked ? <Note>La hoja de arriba es la vista previa. El botón de imprimir se abre con el pago.</Note> : null}
      </div>
    </div>
  );
}
