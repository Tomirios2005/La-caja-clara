import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Kicker } from "@/components/ui";
import { GUIDES } from "@/lib/guides";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/guias")({
  head: () =>
    pageHead({
      title: "Guías de sueldo, aguinaldo, monotributo e IPC — Caja Clara",
      description:
        "Notas cortas para leer el recibo de sueldo, calcular el aguinaldo, entender el monotributo, el IPC y el peso del alquiler.",
      path: "/guias",
      keywords: [
        "guía recibo de sueldo",
        "cómo calcular aguinaldo",
        "monotributo explicación",
        "qué es el IPC",
        "alquiler y sueldo",
      ],
    }),
  component: GuiasPage,
});

function GuiasPage() {
  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Kicker>Para leer</Kicker>
        <h1 className="mt-2 font-serif text-4xl">Guías</h1>
        <div className="mt-6 space-y-3">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              to="/guia/$slug"
              params={{ slug: guide.slug }}
              className="block rounded-lg border border-line bg-surface p-4 hover:border-brass"
            >
              <span className="text-xs uppercase tracking-widest text-muted">{guide.minutes} min</span>
              <span className="mt-1 block font-serif text-2xl leading-snug">{guide.title}</span>
              <span className="mt-2 block text-sm leading-relaxed text-muted">{guide.dek}</span>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}
