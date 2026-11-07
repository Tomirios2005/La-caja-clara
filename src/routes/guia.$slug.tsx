import { createFileRoute, Link } from "@tanstack/react-router";
import { AdSlot } from "@/components/ad-slot";
import { Shell } from "@/components/shell";
import { getGuide } from "@/lib/guides";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/guia/$slug")({
  head: ({ params }) => {
    const guide = getGuide(params.slug);
    return pageHead({
      title: `${guide?.title ?? "Guía"} — Caja Clara`,
      description: guide?.dek ?? "Guía corta de Caja Clara sobre sueldos, monotributo e inflación en Argentina.",
      path: `/guia/${params.slug}`,
      keywords: [guide?.title ?? "guía", "sueldo", "monotributo", "IPC", "Argentina"],
    });
  },
  component: GuiaPage,
});

function GuiaPage() {
  const { slug } = Route.useParams();
  const guide = getGuide(slug);
  if (!guide) {
    return (
      <Shell>
        <section className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="font-serif text-3xl">Esa guía no está</h1>
          <Link to="/guias" className="mt-4 inline-flex min-h-11 items-center text-brass">
            Ver las guías
          </Link>
        </section>
      </Shell>
    );
  }
  return (
    <Shell>
      <article className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <p className="text-xs uppercase tracking-widest text-muted">{guide.minutes} min</p>
        <h1 className="mt-2 font-serif text-4xl leading-tight">{guide.title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">{guide.dek}</p>
        <div className="mt-6">
          <AdSlot slot={0} />
        </div>
        {guide.sections.map((section) => (
          <section key={section.h} className="mt-8">
            <h2 className="font-serif text-2xl">{section.h}</h2>
            {section.p.map((para) => (
              <p key={para.slice(0, 24)} className="mt-3 leading-relaxed">
                {para}
              </p>
            ))}
          </section>
        ))}
        <p className="mt-10">
          <Link to="/guias" className="text-sm text-brass">
            Todas las guías
          </Link>
        </p>
      </article>
    </Shell>
  );
}
