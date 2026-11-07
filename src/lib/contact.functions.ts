import { createServerFn } from "@tanstack/react-start";

const FROM = "hola@lacajaclara.com.ar";
/** Verified Email Routing destination. Not shown on the site. */
const TO = "tomirios2005@gmail.com";

type Kind = "consulta" | "sugerencia";

type EmailBinding = {
  send(message: {
    to: string;
    from: string;
    replyTo?: string;
    subject: string;
    text: string;
  }): Promise<{ messageId: string }>;
};

function emailBinding(): EmailBinding | null {
  const bag = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const binding = bag?.EMAIL as EmailBinding | undefined;
  if (binding && typeof binding.send === "function") return binding;
  return null;
}

function clean(value: string, max: number) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}

export const enviarMensaje = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Datos inválidos");
    const d = data as { kind?: unknown; name?: unknown; email?: unknown; message?: unknown; company?: unknown };
    if (typeof d.company === "string" && d.company.trim()) return { honeypot: true as const };
    const kind: Kind = d.kind === "sugerencia" ? "sugerencia" : d.kind === "consulta" ? "consulta" : ("" as Kind);
    const name = typeof d.name === "string" ? clean(d.name, 80) : "";
    const email = typeof d.email === "string" ? clean(d.email, 120) : "";
    const message = typeof d.message === "string" ? clean(d.message, 4000) : "";
    if (!kind) throw new Error("Elegí si es una consulta o una sugerencia");
    if (name.length < 2) throw new Error("Falta el nombre");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("El correo no parece válido");
    if (message.length < 10) throw new Error("El mensaje es muy corto");
    return { honeypot: false as const, kind, name, email, message };
  })
  .handler(async ({ data }) => {
    if (data.honeypot) return { ok: true as const };
    const email = emailBinding();
    if (!email) return { ok: false as const, reason: "El correo del sitio todavía no está conectado." };
    const label = data.kind === "sugerencia" ? "Sugerencia" : "Consulta";
    const text = [`${label} desde lacajaclara.com.ar`, "", `Nombre: ${data.name}`, `Respuesta: ${data.email}`, "", data.message].join(
      "\n",
    );
    try {
      await email.send({
        to: TO,
        from: FROM,
        replyTo: data.email,
        subject: `[Caja Clara] ${label} de ${data.name}`,
        text,
      });
      return { ok: true as const };
    } catch (err) {
      const detail = err instanceof Error ? err.message : "";
      console.error("contact send failed", detail);
      return {
        ok: false as const,
        reason: "No se pudo enviar ahora. Escribí directo a hola@lacajaclara.com.ar.",
      };
    }
  });
