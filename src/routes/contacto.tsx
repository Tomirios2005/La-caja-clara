import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Shell } from "@/components/shell";
import { Button, Kicker, Panel } from "@/components/ui";
import { enviarMensaje } from "@/lib/contact.functions";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contacto")({
  head: () =>
    pageHead({
      title: "Contacto — Caja Clara",
      description: "Escribí a hola@lacajaclara.com.ar con una consulta sobre las calculadoras o una sugerencia.",
      path: "/contacto",
      keywords: ["contacto Caja Clara", "hola@lacajaclara.com.ar"],
    }),
  component: ContactoPage,
});

const MAIL = "hola@lacajaclara.com.ar";

function ContactoPage() {
  const [kind, setKind] = useState<"consulta" | "sugerencia">("consulta");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await enviarMensaje({ data: { kind, name, email, message, company } });
      if (!res.ok) {
        setError(res.reason);
        return;
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Shell>
      <article className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Kicker>Contacto</Kicker>
        <h1 className="mt-2 font-serif text-4xl leading-tight">Escribinos</h1>
        <p className="mt-4 leading-relaxed">
          El correo del sitio es{" "}
          <a className="text-brass" href={`mailto:${MAIL}`}>
            {MAIL}
          </a>
          . También podés dejar una consulta o una sugerencia de mejora y llega al mismo buzón.
        </p>

        {done ? (
          <Panel className="mt-8">
            <p className="font-serif text-2xl">Llegó.</p>
            <p className="mt-2 leading-relaxed text-muted">
              Si hace falta una respuesta, te escribimos a {email}.
            </p>
          </Panel>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <fieldset>
              <legend className="text-sm">Motivo</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Choice
                  checked={kind === "consulta"}
                  onChange={() => setKind("consulta")}
                  title="Consulta"
                  hint="Una duda sobre una cuenta, un pago o el sitio."
                />
                <Choice
                  checked={kind === "sugerencia"}
                  onChange={() => setKind("sugerencia")}
                  title="Sugerencia de mejora"
                  hint="Algo que falta, que está mal o que se puede decir más claro."
                />
              </div>
            </fieldset>

            <label className="block text-sm">
              Nombre
              <input
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-3 text-base outline-none focus:border-brass"
              />
            </label>
            <label className="block text-sm">
              Tu correo, para responderte
              <input
                required
                type="email"
                maxLength={120}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-3 text-base outline-none focus:border-brass"
              />
            </label>
            <label className="block text-sm">
              Mensaje
              <textarea
                required
                minLength={10}
                maxLength={4000}
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-3 text-base outline-none focus:border-brass"
              />
            </label>
            <label className="absolute -left-[9999px]" aria-hidden="true">
              Empresa
              <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
            </label>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <Button type="submit" disabled={pending}>
              {pending ? "Enviando…" : "Enviar"}
            </Button>
          </form>
        )}

        <p className="mt-8 text-sm text-muted">
          Las calculadoras siguen sin guardar lo que escribís. Este formulario solo manda el mensaje de esta página.{" "}
          <Link to="/nosotros" className="text-brass">
            Quién publica el sitio
          </Link>
          .
        </p>
      </article>
    </Shell>
  );
}

function Choice({
  checked,
  onChange,
  title,
  hint,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  hint: string;
}) {
  return (
    <label
      className={
        "flex min-h-11 cursor-pointer flex-col rounded-lg border px-3 py-3 " +
        (checked ? "border-brass bg-surface" : "border-line bg-surface")
      }
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <input type="radio" name="kind" checked={checked} onChange={onChange} />
        {title}
      </span>
      <span className="mt-1 pl-6 text-xs leading-relaxed text-muted">{hint}</span>
    </label>
  );
}
