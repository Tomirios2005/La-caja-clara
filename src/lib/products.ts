export type Product = {
  id: string;
  name: string;
  price: number;
  blurb: string;
  includes: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "presupuesto",
    name: "Presupuesto para clientes",
    price: 7900,
    blurb: "Armá un presupuesto con tu nombre, ítems y total. Imprimilo o guardalo como PDF, sin marca de agua.",
    includes: [
      "Hoja lista para imprimir o guardar como PDF",
      "Tu nombre, CUIT y condiciones",
      "Ítems, cantidades y total",
      "Sin la marca de vista previa",
    ],
  },
  {
    id: "plan",
    name: "Plan de un año",
    price: 9900,
    blurb: "Doce meses de gastos con un ajuste mensual. Ves el año entero y te llevás el CSV.",
    includes: [
      "Categorías de una casa en Argentina",
      "Ajuste mes a mes por inflación",
      "Gráfico del año",
      "Exportación CSV",
    ],
  },
  {
    id: "pro",
    name: "Caja Pro",
    price: 14900,
    blurb: "Los dos anteriores y el sitio sin avisos en este navegador. Un solo pago.",
    includes: [
      "Presupuesto para clientes",
      "Plan de un año con CSV",
      "Sin espacios de publicidad en este dispositivo",
    ],
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
