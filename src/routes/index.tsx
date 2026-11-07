import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdSlot } from "@/components/ad-slot";
import { Shell } from "@/components/shell";
import { useRatesRevision } from "@/components/rates-live";
import { calcSueldo } from "@/lib/calc";
import { GUIDES } from "@/lib/guides";
import { formatArs, parseMoney } from "@/lib/money";
import { PRODUCTS } from "@/lib/products";
import { RATES } from "@/lib/rates";
import { pageHead } from "@/lib/seo";

const SITE = "https://lacajaclara.com.ar";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Calculadora de sueldo neto, aguinaldo y monotributo — Caja Clara",
      description:
        "Calculá el sueldo neto, el aguinaldo, el alquiler, la inflación del IPC y la categoría de monotributo en Argentina. Gratis, con alícuotas públicas.",
      path: "/",
      keywords: [
        "calculadora sueldo neto",
        "sueldo bruto a neto",
        "calculadora aguinaldo",
        "calculadora monotributo",
        "categorías monotributo",
        "calculadora alquiler",
        "IPC INDEC",
        "tarifa freelance",
        "Argentina",
      ],
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            name: "Caja Clara",
            url: `${SITE}/`,
            description:
              "Calculadoras de sueldo neto, aguinaldo, alquiler, inflación y monotributo para Argentina.",
            inLanguage: "es-AR",
            publisher: {
              "@type": "Organization",
              name: "Caja Clara",
              url: `${SITE}/`,
              logo: `${SITE}/logo.png`,
            },
          },
          {
            "@type": "ItemList",
            name: "Calculadoras",
            itemListElement: [
              ["Calculadora de sueldo neto", "/sueldo"],
              ["Calculadora de aguinaldo", "/aguinaldo"],
              ["Calculadora de alquiler", "/alquiler"],
              ["Calculadora de inflación e IPC", "/inflacion"],
              ["Calculadora de monotributo", "/monotributo"],
              ["Tarifa por hora freelance", "/freelance"],
              ["Comparar ofertas de trabajo", "/comparar"],
            ].map(([name, path], index) => ({
              "@type": "ListItem",
              position: index + 1,
              name,
              url: `${SITE}${path}`,
            })),
          },
        ],
      },
    }),
  component: Home,
});

const TOOLS = [
  { to: "/sueldo", title: "Sueldo neto", text: "Del bruto a la mano, con jubilación, PAMI y obra social." },
  { to: "/aguinaldo", title: "Aguinaldo", text: "El SAC del semestre, en bruto y después de aportes." },
  { to: "/alquiler", title: "Alquiler", text: "Cuánto queda del aumento y qué parte del neto se lleva." },
  { to: "/inflacion", title: "Inflación", text: "El IPC del INDEC y cuánta plata vas a necesitar." },
  { to: "/monotributo", title: "Monotributo", text: "Categoría y cuota según el cuadro vigente de ARCA." },
  { to: "/freelance", title: "Tarifa por hora", text: "Lo que tenés que cobrar para llegar a un neto." },
  { to: "/comparar", title: "Dos ofertas", text: "Cuál laburo deja más, hora por hora." },
] as const;

function mesActual() {
  const parts = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    month: "long",
    year: "numeric",
  }).formatToParts(new Date());
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  return `${month} ${year}`;
}

function Home() {
  const revision = useRatesRevision();
  const [bruto, setBruto] = useState("1200000");
  const neto = useMemo(
    () => calcSueldo({ bruto: parseMoney(bruto), sindicato: false, sindicatoPct: 0, noRemunerativo: 0 }).neto,
    [bruto, revision],
  );

  return (
    <Shell>
      <section className="mx-auto max-w-5xl px-4 pt-8 pb-4 md:px-6 md:pt-14">
        <p className="text-xs font-medium uppercase tracking-widest text-brass">Argentina · {mesActual()}</p>
        <h1 className="mt-3 max-w-xl font-serif text-5xl leading-tight md:text-6xl">Cuánto te queda, de verdad.</h1>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted">
          Calculadora de sueldo neto, aguinaldo, alquiler, inflación y monotributo para Argentina. Si trabajás por tu
          cuenta, también hay tarifa por hora, presupuestos y un plan del año.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 md:grid-cols-[1.1fr_0.9fr] md:px-6">
        <div className="rounded-lg border border-line bg-surface p-5">
          <p className="text-xs uppercase tracking-widest text-muted">Recibo rápido</p>
          <p className="mt-3 text-sm text-muted">Bruto</p>
          <p className="font-serif text-4xl tabular-nums">{formatArs(parseMoney(bruto))}</p>
          <input
            className="mt-4"
            type="range"
            min={RATES.smvm}
            max={5000000}
            step={10000}
            value={Math.min(5000000, Math.max(RATES.smvm, parseMoney(bruto) || RATES.smvm))}
            onChange={(e) => setBruto(e.target.value)}
            aria-label="Sueldo bruto"
          />
          <p className="mt-6 text-sm text-muted">En mano, sin sindicato ni Ganancias</p>
          <p className="font-serif text-5xl tabular-nums text-ink">{formatArs(neto)}</p>
          <Link to="/sueldo" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-brass">
            Abrir la cuenta completa
          </Link>
        </div>
        <div className="grid gap-2">
          {TOOLS.slice(0, 4).map((tool) => (
            <Link key={tool.to} to={tool.to} className="rounded-lg border border-line bg-surface px-4 py-3 hover:border-brass">
              <span className="font-medium">{tool.title}</span>
              <span className="mt-0.5 block text-sm text-muted">{tool.text}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <AdSlot slot={0} />
      </section>

      <section className="mx-auto max-w-5xl px-4 md:px-6">
        <h2 className="font-serif text-3xl">El resto de las cuentas</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {TOOLS.slice(4).map((tool) => (
            <Link key={tool.to} to={tool.to} className="rounded-lg border border-line bg-surface p-4 hover:border-brass">
              <span className="font-medium">{tool.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">{tool.text}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <h2 className="font-serif text-3xl">Para vender, no solo para mirar</h2>
        <p className="mt-2 max-w-lg text-muted">Un pago por Mercado Pago. La herramienta queda en este navegador.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {PRODUCTS.map((product) => (
            <Link
              key={product.id}
              to="/producto/$slug"
              params={{ slug: product.id }}
              className="flex flex-col rounded-lg border border-line bg-surface p-4 hover:border-brass"
            >
              <span className="text-sm text-muted">{product.name}</span>
              <span className="mt-2 font-serif text-3xl tabular-nums">{formatArs(product.price)}</span>
              <span className="mt-2 text-sm leading-relaxed text-muted">{product.blurb}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 md:px-6">
        <h2 className="font-serif text-3xl">Guías cortas</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              to="/guia/$slug"
              params={{ slug: guide.slug }}
              className="rounded-lg border border-line p-4 hover:border-brass"
            >
              <span className="text-xs uppercase tracking-widest text-muted">{guide.minutes} min</span>
              <span className="mt-2 block font-serif text-xl leading-snug">{guide.title}</span>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}
