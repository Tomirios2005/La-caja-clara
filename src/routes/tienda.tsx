import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Kicker } from "@/components/ui";
import { formatArs } from "@/lib/money";
import { PRODUCTS } from "@/lib/products";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/tienda")({
  head: () =>
    pageHead({
      title: "Presupuestos y plan anual — Tienda de Caja Clara",
      description:
        "Presupuesto para clientes, plan de gastos de un año y Caja Pro. Un pago con Mercado Pago, para quien trabaja por su cuenta en Argentina.",
      path: "/tienda",
      keywords: [
        "presupuesto para clientes",
        "plan de gastos anual",
        "herramientas monotributo",
        "Caja Pro",
        "Mercado Pago",
      ],
    }),
  component: TiendaPage,
});

function TiendaPage() {
  return (
    <Shell>
      <section className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <Kicker>Mercado Pago</Kicker>
        <h1 className="mt-2 font-serif text-4xl leading-tight">Lo que se cobra</h1>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          Las calculadoras siguen gratis. Acá están las piezas para trabajar: un presupuesto presentable y un plan de
          gastos del año. Un pago, en este navegador.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {PRODUCTS.map((product) => (
            <Link
              key={product.id}
              to="/producto/$slug"
              params={{ slug: product.id }}
              className="flex flex-col rounded-lg border border-line bg-surface p-4 hover:border-brass"
            >
              <span className="font-medium">{product.name}</span>
              <span className="mt-3 font-serif text-3xl tabular-nums">{formatArs(product.price)}</span>
              <span className="mt-2 text-sm leading-relaxed text-muted">{product.blurb}</span>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}
