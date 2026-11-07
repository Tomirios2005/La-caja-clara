import { createFileRoute, Link } from "@tanstack/react-router";
import { AdSlot } from "@/components/ad-slot";
import { BuyBox } from "@/components/buy-box";
import { PlanTool } from "@/components/plan-tool";
import { QuoteTool } from "@/components/quote-tool";
import { Shell } from "@/components/shell";
import { Kicker } from "@/components/ui";
import { useEntitlements } from "@/lib/entitlements";
import { getProduct } from "@/lib/products";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/producto/$slug")({
  head: ({ params }) => {
    const product = getProduct(params.slug);
    return pageHead({
      title: `${product?.name ?? "Producto"} — Caja Clara`,
      description: product?.blurb ?? "Herramienta de pago de Caja Clara, con Mercado Pago.",
      path: `/producto/${params.slug}`,
      keywords: [product?.name ?? "Caja Clara", "presupuesto", "plan de gastos", "Mercado Pago"],
    });
  },
  component: ProductoPage,
});

function ProductoPage() {
  const { slug } = Route.useParams();
  const product = getProduct(slug);
  const { has } = useEntitlements();

  if (!product) {
    return (
      <Shell>
        <section className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="font-serif text-3xl">Ese producto no está</h1>
          <Link to="/tienda" className="mt-4 inline-flex min-h-11 items-center text-brass">
            Volver a la tienda
          </Link>
        </section>
      </Shell>
    );
  }

  return (
    <Shell>
      <article className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-[minmax(0,1fr)_18rem] md:px-6">
        <div className="order-2 md:order-1">
          <div className="no-print">
            <Kicker>Tienda</Kicker>
            <h1 className="mt-2 font-serif text-4xl leading-tight">{product.name}</h1>
            <p className="mt-3 max-w-xl leading-relaxed text-muted">{product.blurb}</p>
          </div>
          <div className="mt-6">
            {product.id === "presupuesto" ? <QuoteTool unlocked={has("presupuesto")} /> : null}
            {product.id === "plan" ? <PlanTool unlocked={has("plan")} /> : null}
            {product.id === "pro" ? (
              <div className="space-y-3 text-sm leading-relaxed">
                <p>Caja Pro abre el presupuesto, el plan anual y esconde los avisos en este navegador.</p>
                <p>
                  <Link to="/producto/$slug" params={{ slug: "presupuesto" }} className="text-brass">
                    Ir al presupuesto
                  </Link>
                  {" · "}
                  <Link to="/producto/$slug" params={{ slug: "plan" }} className="text-brass">
                    Ir al plan
                  </Link>
                </p>
              </div>
            ) : null}
          </div>
          <div className="mt-8 md:hidden">
            <AdSlot slot={2} />
          </div>
        </div>
        <aside className="no-print order-1 space-y-4 md:order-2">
          <BuyBox product={product} />
          <div className="hidden md:block">
            <AdSlot slot={2} />
          </div>
        </aside>
      </article>
    </Shell>
  );
}
