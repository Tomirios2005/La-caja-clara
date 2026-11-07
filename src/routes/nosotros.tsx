import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Kicker } from "@/components/ui";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/nosotros")({
  head: () =>
    pageHead({
      title: "Quién publica Caja Clara",
      description:
        "Caja Clara es un sitio independiente de calculadoras de sueldo neto, monotributo, alquiler e inflación para Argentina.",
      path: "/nosotros",
      keywords: ["Caja Clara", "calculadoras Argentina", "sueldo neto", "monotributo"],
    }),
  component: NosotrosPage,
});

function NosotrosPage() {
  return (
    <Shell>
      <article className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Kicker>El sitio</Kicker>
        <h1 className="mt-2 font-serif text-4xl leading-tight">Quién publica Caja Clara</h1>
        <div className="mt-6 space-y-4 leading-relaxed">
          <p>
            Caja Clara es un sitio independiente. No es un estudio contable, no es ARCA y no es el INDEC. Lo armamos
            para que una persona en Argentina pueda mirar un número de todos los días —el neto de un sueldo, el
            aguinaldo, la cuota del monotributo, qué parte del ingreso se va en el alquiler— sin abrir una planilla
            ni esperar un turno.
          </p>
          <p>
            Las calculadoras usan alícuotas y topes públicos, citados en{" "}
            <Link to="/legal" className="text-brass">
              Aviso y fuentes
            </Link>
            . La inflación mensual del IPC sale de la serie oficial del INDEC. Cada resultado es una estimación: el
            recibo de tu empleador o la liquidación de tu contador mandan si no coinciden.
          </p>
          <p>
            También hay tres herramientas de pago, una sola vez: un presupuesto para pasarle a un cliente, un plan de
            gastos de doce meses y Caja Pro, que junta las dos y saca los avisos. El cobro lo hace Mercado Pago. Para
            guardar esa compra y verla en otro navegador podés entrar con Google. No creamos una contraseña nuestra:
            Google confirma quién sos y acá solo queda el correo verificado.
          </p>
          <p>
            El salario mínimo y el cuadro del monotributo se leen de las publicaciones oficiales y se refrescan solos.
            El IPC sale del catálogo del INDEC. Las guías explican el criterio de cada cuenta para que el número no
            quede suelto.
          </p>
          <h2 className="pt-4 font-serif text-2xl">Qué vas a encontrar</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Sueldo neto, aguinaldo y comparación de dos ofertas.</li>
            <li>Monotributo por categoría y tarifa por hora si facturás solo.</li>
            <li>Alquiler contra el neto, e inflación con el IPC publicado.</li>
            <li>
              <Link to="/guias" className="text-brass">
                Guías
              </Link>{" "}
              para leer el recibo, el SAC, el monotributo y el índice.
            </li>
          </ul>
          <p>
            Si una cuenta no te cierra, contrastala con el recibo o con ARCA antes de decidir. Lo que escribís en una
            calculadora no se manda a un servidor. Si entrás con Google, en el servidor solo se guardan el correo y
            las compras ya confirmadas por Mercado Pago, para abrirlas en otro equipo.
          </p>
          <p>
            Para una consulta o una sugerencia de mejora, el correo es{" "}
            <a className="text-brass" href="mailto:hola@lacajaclara.com.ar">
              hola@lacajaclara.com.ar
            </a>
            . También hay un{" "}
            <Link to="/contacto" className="text-brass">
              formulario
            </Link>{" "}
            que llega a ese mismo buzón.
          </p>
        </div>
      </article>
    </Shell>
  );
}
