import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button, Note, NumberField } from "@/components/ui";
import { formatArs, parseMoney } from "@/lib/money";

const START: { name: string; amount: string }[] = [
  { name: "Alquiler", amount: "450000" },
  { name: "Expensas", amount: "80000" },
  { name: "Servicios", amount: "90000" },
  { name: "Supermercado", amount: "350000" },
  { name: "Transporte", amount: "60000" },
  { name: "Salud", amount: "40000" },
  { name: "Monotributo o aportes", amount: "50000" },
  { name: "Ocio", amount: "80000" },
  { name: "Ahorro", amount: "100000" },
];

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function PlanTool({ unlocked }: { unlocked: boolean }) {
  const [rows, setRows] = useState(START);
  const [bump, setBump] = useState("2");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const base = rows.reduce((s, r) => s + Math.max(0, parseMoney(r.amount)), 0);
  const rate = parseMoney(bump) / 100;
  const series = MONTHS.map((mes, i) => ({
    mes,
    total: Math.round(base * (1 + rate) ** i),
  }));
  const year = series.reduce((s, p) => s + p.total, 0);

  function download() {
    const header = ["mes", ...rows.map((r) => r.name), "total"];
    const lines = [header.join(",")];
    series.forEach((point, i) => {
      const factor = (1 + rate) ** i;
      const cells = rows.map((r) => String(Math.round(Math.max(0, parseMoney(r.amount)) * factor)));
      lines.push([point.mes, ...cells, String(point.total)].join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plan-caja-clara.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="no-print grid gap-3">
        {rows.map((row, i) => (
          <NumberField
            key={row.name}
            label={row.name}
            value={row.amount}
            onChange={(amount) => setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, amount } : r)))}
          />
        ))}
        <NumberField
          label="Ajuste mensual"
          hint="Cada mes los rubros suben este porcentaje. Poné 0 si querés un año plano."
          suffix="%"
          value={bump}
          onChange={setBump}
        />
      </div>
      <div className="rounded-lg border border-line bg-surface p-4">
        <p className="text-sm text-muted">Este mes</p>
        <p className="font-serif text-3xl tabular-nums">{formatArs(base)}</p>
        <p className="mt-2 text-sm text-muted">
          Los doce meses suman <span className="tabular-nums text-ink">{formatArs(year)}</span>
        </p>
        <div className="mt-4 h-56 w-full">
          {ready ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <XAxis dataKey="mes" tick={{ fill: "#6f675e", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => formatArs(Number(v ?? 0))}
                  cursor={{ fill: "#f3efe6" }}
                  contentStyle={{
                    background: "#faf7f1",
                    border: "1px solid #e2d9cc",
                    borderRadius: 8,
                    color: "#1a1714",
                  }}
                />
                <Bar dataKey="total" fill="#9a6232" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>
      <div className="no-print space-y-2">
        <Button onClick={download} disabled={!unlocked}>
          Bajar CSV
        </Button>
        {!unlocked ? <Note>El gráfico es para mirar. El archivo se descarga después del pago.</Note> : null}
      </div>
    </div>
  );
}
