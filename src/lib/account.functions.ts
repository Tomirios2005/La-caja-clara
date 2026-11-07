import { createServerFn } from "@tanstack/react-start";
import { createSession, destroySession, googleClientId, readSession } from "@/lib/account-store";

const COOKIE = "cc_session";

async function cookieJar() {
  return import("@tanstack/react-start/server");
}

async function currentSession() {
  const { getCookie } = await cookieJar();
  return readSession(getCookie(COOKIE) ?? "");
}

function cookieOptions(maxAge: number) {
  return { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge };
}

export const accountState = createServerFn({ method: "GET" }).handler(async () => {
  const session = await currentSession();
  return {
    clientId: googleClientId(),
    email: session?.email ?? "",
    products: session?.products ?? [],
  };
});

export const signInGoogle = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Datos inválidos");
    const credential = String((data as { credential?: unknown }).credential ?? "").trim();
    if (!credential || credential.length > 4000) throw new Error("Datos inválidos");
    return { credential };
  })
  .handler(async ({ data }) => {
    const clientId = googleClientId();
    if (!clientId) return { ok: false as const, reason: "missing_client" as const, email: "", products: [] as string[] };
    const infoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(data.credential)}`,
    );
    if (!infoRes.ok) return { ok: false as const, reason: "rejected" as const, email: "", products: [] as string[] };
    const info = (await infoRes.json()) as {
      aud?: string;
      sub?: string;
      email?: string;
      email_verified?: string | boolean;
    };
    const verified = info.email_verified === true || info.email_verified === "true";
    if (!info.sub || !info.email || info.aud !== clientId || !verified) {
      return { ok: false as const, reason: "rejected" as const, email: "", products: [] as string[] };
    }
    const sessionId = await createSession(info.sub, info.email);
    if (!sessionId) return { ok: false as const, reason: "storage" as const, email: "", products: [] as string[] };
    const { setCookie } = await cookieJar();
    setCookie(COOKIE, sessionId, cookieOptions(60 * 60 * 24 * 30));
    const session = await readSession(sessionId);
    return { ok: true as const, reason: "" as const, email: info.email, products: session?.products ?? [] };
  });

export const signOutGoogle = createServerFn({ method: "POST" }).handler(async () => {
  const { getCookie, setCookie } = await cookieJar();
  await destroySession(getCookie(COOKIE) ?? "");
  setCookie(COOKIE, "", cookieOptions(0));
  return { ok: true };
});
