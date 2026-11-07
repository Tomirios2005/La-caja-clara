import { createFileRoute, Link } from "@tanstack/react-router";
import { useRatesRevision } from "@/components/rates-live";
import { Shell } from "@/components/shell";
import { Kicker } from "@/components/ui";
import { RATES } from "@/lib/rates";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/legal")({
  head: () =>
    pageHead({
      title: "Aviso y fuentes de las calculadoras — Caja Clara",
      description:
        "Qué estiman las calculadoras de sueldo, aguinaldo y monotributo, qué no reemplazan, y de dónde salen las alícuotas.",
      path: "/legal",
      keywords: ["aviso legal", "fuentes IPC", "salario mínimo", "monotributo ARCA", "Caja Clara"],
    }),
  component: LegalPage,
});

function LegalPage() {
  useRatesRevision();
  return (
    <Shell>
      <article className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Kicker>En claro</Kicker>
        <h1 className="mt-2 font-serif text-4xl">Aviso y fuentes</h1>
        <div className="mt-6 space-y-4 leading-relaxed">
          <p>
            Caja Clara estima. No es ARCA, no es ANSES y no reemplaza a un contador. El sueldo neto de acá no descuenta
            Impuesto a las Ganancias, embargos ni cuotas de préstamos.
          </p>
          <p>
            Aportes del trabajador usados en {RATES.vigencia}: 11% jubilación (Ley 24.241), 3% INSSJP y 3% obra social,
            sobre la remuneración y con una base máxima. La base que muestra el sitio ({RATES.baseMax.toLocaleString("es-AR")}{" "}
            pesos) es una referencia publicada para noviembre de 2026; no sale de una serie automática. El SMVM de{" "}
            {RATES.vigencia} es {RATES.smvm.toLocaleString("es-AR")} pesos ({RATES.horaSmvm.toLocaleString("es-AR")} la
            hora), leído de la serie oficial de la Secretaría de Trabajo.
          </p>
          <p>
            Las cuotas y topes del monotributo se leen del cuadro de ARCA vigente desde el {RATES.monoVigencia}. Ese
            cuadro se actualiza dos veces por año, en febrero y en agosto. Pueden no coincidir con tu cuota si no pagás
            obra social o aporte previsional.
          </p>
          <p>
            Las compras quedan guardadas en este navegador después de que Mercado Pago confirma el pago. Si cambiás de
            celular o borrás los datos del sitio, hay que verificar de nuevo el número de operación. No guardamos
            cuentas de usuario.
          </p>
          <p>
            El IPC de la calculadora de inflación es el nivel general nacional del INDEC, base diciembre 2016 = 100.
            La variación de cada mes se calcula contra el índice del mes anterior. Si en el hosting hay un token del
            catálogo api.indec.gob.ar, la serie sale de la tabla ipc_nacional (paginada con limit y offset). Si no,
            sale de la serie abierta 148.3_INIVELNAL_DICI_M_26 en apis.datos.gob.ar, que publica el mismo índice. El
            dato llega hasta el último mes que el INDEC ya difundió.
          </p>
          <h2 className="pt-4 font-serif text-2xl">Qué se guarda en el navegador</h2>
          <p>
            No hay registro ni cuenta. Los importes que escribís en una calculadora se quedan en tu dispositivo. Una
            compra confirmada por Mercado Pago se anota en el almacenamiento local de este navegador, con la clave del
            producto, para no volver a cobrarla en ese mismo equipo. Borrar los datos del sitio o abrir otro celular
            deja la compra sin marcar: se vuelve a verificar con el número de operación. El servidor consulta a
            Mercado Pago para saber si el pago está aprobado y si el importe coincide con el precio. No guardamos la
            tarjeta ni la contraseña de Mercado Pago.
          </p>
          <h2 className="pt-4 font-serif text-2xl">Pagos</h2>
          <p>
            Las herramientas de pago son de un solo cargo. El checkout lo abre Mercado Pago. Si el pago queda
            pendiente, rechazado o el importe no coincide con el producto, la descarga no se habilita. El precio
            publicado en la tienda es el que se contrasta con el cobro.
          </p>
          <h2 className="pt-4 font-serif text-2xl">Anuncios</h2>
          <p>
            Los espacios marcados «Aviso» son de la propia tienda. Los marcados «Publicidad» son anuncios de Google
            AdSense. El sitio carga el script del publicador ca-pub-2091064770384589. Google puede usar cookies para
            mostrar y medir anuncios según su propia política. Caja Clara no elige el aviso que ves ni recibe los
            datos de tu cuenta de Google.
          </p>
          <h2 className="pt-4 font-serif text-2xl">Cuenta de Google</h2>
          <p>
            Si entrás con Google, guardamos el correo verificado y las compras que Mercado Pago confirmó, para abrirlas
            en otro navegador y ocultar los avisos de Caja Pro. La sesión queda en una cookie de este sitio. Salir
            borra la sesión, no las compras. Sin entrar, las compras siguen solo en este navegador.
          </p>
          <h2 className="pt-4 font-serif text-2xl">Quién publica</h2>
          <p>
            Caja Clara es un sitio independiente. No representa a ARCA, al INDEC, a ANSES ni a Mercado Pago. El criterio
            de cada cuenta está en las guías. Si un número no coincide con tu recibo o con tu constancia, prevalece el
            documento oficial. El contacto es{" "}
            <a className="text-brass" href="mailto:hola@lacajaclara.com.ar">
              hola@lacajaclara.com.ar
            </a>{" "}
            o el{" "}
            <Link to="/contacto" className="text-brass">
              formulario
            </Link>
            .
          </p>
        </div>
      </article>
    </Shell>
  );
}
