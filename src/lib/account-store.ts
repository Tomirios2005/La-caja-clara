type UserRow = { email: string; products: string[] };
type SessionRow = { sub: string; email: string };

type Kv = {
  get(key: string, type: "json"): Promise<unknown>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};

function envValue(name: string) {
  const fromProcess = typeof process !== "undefined" ? process.env[name]?.trim() : "";
  if (fromProcess) return fromProcess;
  const bag = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const bound = bag?.[name];
  return typeof bound === "string" ? bound.trim() : "";
}

function kv(): Kv | null {
  const bag = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const binding = bag?.ENTITLEMENTS as Kv | undefined;
  if (binding && typeof binding.get === "function" && typeof binding.put === "function") return binding;
  return null;
}

export function googleClientId() {
  return envValue("GOOGLE_CLIENT_ID");
}

const SESSION_TTL = 60 * 60 * 24 * 30;

export async function createSession(sub: string, email: string) {
  const store = kv();
  if (!store) return null;
  const id = crypto.randomUUID();
  await store.put(`s:${id}`, JSON.stringify({ sub, email } satisfies SessionRow), { expirationTtl: SESSION_TTL });
  const existing = (await store.get(`u:${sub}`, "json")) as UserRow | null;
  await store.put(
    `u:${sub}`,
    JSON.stringify({ email, products: existing?.products ?? [] } satisfies UserRow),
  );
  return id;
}

export async function readSession(sessionId: string) {
  const store = kv();
  if (!store || !sessionId) return null;
  const session = (await store.get(`s:${sessionId}`, "json")) as SessionRow | null;
  if (!session?.sub) return null;
  const user = (await store.get(`u:${session.sub}`, "json")) as UserRow | null;
  return {
    sub: session.sub,
    email: user?.email || session.email,
    products: Array.isArray(user?.products) ? user.products : [],
  };
}

export async function destroySession(sessionId: string) {
  const store = kv();
  if (!store || !sessionId) return;
  await store.delete(`s:${sessionId}`);
}

export async function addProduct(sub: string, productId: string) {
  const store = kv();
  if (!store || !sub || !productId) return [];
  const user = (await store.get(`u:${sub}`, "json")) as UserRow | null;
  if (!user) return [];
  const products = new Set(user.products);
  products.add(productId);
  if (productId === "pro") {
    products.add("presupuesto");
    products.add("plan");
  }
  const next = [...products];
  await store.put(`u:${sub}`, JSON.stringify({ ...user, products: next }));
  return next;
}

export async function sessionFromCookie(sessionId: string) {
  return readSession(sessionId);
}
