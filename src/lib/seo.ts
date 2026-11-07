const SITE = "https://lacajaclara.com.ar";

type JsonLd = Record<string, unknown>;

export function pageHead(input: {
  title: string;
  description: string;
  path: string;
  keywords: string[];
  jsonLd?: JsonLd;
}) {
  const url = input.path === "/" ? `${SITE}/` : `${SITE}${input.path}`;
  const data: JsonLd = input.jsonLd ?? {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.title,
    description: input.description,
    url,
    inLanguage: "es-AR",
    isPartOf: { "@type": "WebSite", name: "Caja Clara", url: `${SITE}/` },
  };

  return {
    meta: [
      { title: input.title },
      { name: "description", content: input.description },
      { name: "keywords", content: input.keywords.join(", ") },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(data) }],
  };
}
