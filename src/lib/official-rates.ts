import { createServerFn } from "@tanstack/react-start";
import { MONOTRIBUTO, RATES, type MonoCat } from "@/lib/rates";

const SMVM_URL = "https://apis.datos.gob.ar/series/api/series/";
const ARCA_URL = "https://www.arca.gob.ar/monotributo/categorias.asp";
const CACHE_KEY = "official-rates";
const MAX_AGE_MS = 6 * 24 * 60 * 60 * 1000;

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export type OfficialRates = {
  fetchedAt: string;
  vigencia: string;
  smvm: number;
  horaSmvm: number;
  smvmDate: string;
  smvmSource: string;
  monoVigencia: string;
  monoSource: string;
  monotributo: MonoCat[];
};

type Kv = {
  get(key: string, type: "json"): Promise<unknown>;
  put(key: string, value: string): Promise<void>;
};

function kv(): Kv | null {
  const bag = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const binding = bag?.ENTITLEMENTS as Kv | undefined;
  if (binding && typeof binding.get === "function") return binding;
  return null;
}

function parseArs(raw: string) {
  const n = Number(raw.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function parseMonotributoHtml(html: string): { vigencia: string; rows: MonoCat[] } | null {
  const vigencia = html.match(/Valores de aplicación desde el (\d{1,2}\/\d{1,2}\/\d{4})/)?.[1] ?? "";
  const rows: MonoCat[] = [];
  const pattern = /<th[^>]*>\s*([A-K])\s*<\/th>([\s\S]*?)<\/tr>/g;
  for (const match of html.matchAll(pattern)) {
    const amounts = [...match[2].matchAll(/\$\s*([\d.]+,\d{2})/g)]
      .map((item) => parseArs(item[1]))
      .filter((n): n is number => n != null);
    if (amounts.length < 9) continue;
    rows.push({ cat: match[1], tope: amounts[0], servicios: amounts[7], bienes: amounts[8] });
  }
  if (rows.length !== 11) return null;
  if (rows.some((row, i) => i > 0 && row.tope <= rows[i - 1].tope)) return null;
  if (rows.some((row) => row.servicios <= 0 || row.bienes <= 0 || row.tope < 1_000_000)) return null;
  return { vigencia, rows };
}

function monthKey(date = new Date()) {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
  }).format(date);
  return formatted.slice(0, 7);
}

function labelOf(iso: string) {
  const [year, month] = iso.slice(0, 7).split("-");
  return `${MONTHS[Number(month) - 1] ?? month} ${year}`;
}

async function fetchSmvm(): Promise<Pick<OfficialRates, "smvm" | "horaSmvm" | "smvmDate" | "vigencia"> | null> {
  const params = new URLSearchParams({
    ids: "57.1_SMVMM_0_M_34,57.1_SMVMH_0_M_31",
    end_date: monthKey(),
    limit: "1",
    sort: "desc",
    format: "json",
    metadata: "none",
  });
  const res = await fetch(`${SMVM_URL}?${params}`);
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: [string, number, number][] };
  const row = json.data?.[0];
  if (!row) return null;
  const [date, smvm, hora] = row;
  if (smvm < 100_000 || smvm > 5_000_000 || hora < 400 || hora > 30_000) return null;
  return { smvm, horaSmvm: hora, smvmDate: date, vigencia: labelOf(date) };
}

async function fetchMono() {
  const res = await fetch(ARCA_URL, { headers: { Accept: "text/html" } });
  if (!res.ok) return null;
  const html = await res.text();
  const parsed = parseMonotributoHtml(html);
  if (!parsed) return null;
  return parsed;
}

export function fallbackRates(): OfficialRates {
  return {
    fetchedAt: "",
    vigencia: RATES.vigencia,
    smvm: RATES.smvm,
    horaSmvm: RATES.horaSmvm,
    smvmDate: "",
    smvmSource: "Valor de respaldo guardado en el sitio.",
    monoVigencia: RATES.monoVigencia,
    monoSource: "Cuadro de respaldo guardado en el sitio.",
    monotributo: MONOTRIBUTO.map((row) => ({ ...row })),
  };
}

export async function refreshOfficialRates(): Promise<OfficialRates | null> {
  const [smvm, mono] = await Promise.all([
    fetchSmvm().catch(() => null),
    fetchMono().catch(() => null),
  ]);
  const previous = await readCached();
  const base = previous ?? fallbackRates();
  if (!smvm && !mono) return previous;
  const next: OfficialRates = {
    fetchedAt: new Date().toISOString(),
    vigencia: smvm?.vigencia ?? base.vigencia,
    smvm: smvm?.smvm ?? base.smvm,
    horaSmvm: smvm?.horaSmvm ?? base.horaSmvm,
    smvmDate: smvm?.smvmDate ?? base.smvmDate,
    smvmSource: smvm
      ? "Secretaría de Trabajo, serie 57.1 en apis.datos.gob.ar. El valor es el del mes en curso, no un aumento ya anunciado para más adelante."
      : base.smvmSource,
    monoVigencia: mono?.vigencia ?? base.monoVigencia,
    monoSource: mono
      ? "Cuadro de categorías de ARCA, arca.gob.ar/monotributo/categorias.asp."
      : base.monoSource,
    monotributo: mono?.rows ?? base.monotributo,
  };
  const store = kv();
  if (store) await store.put(CACHE_KEY, JSON.stringify(next));
  return next;
}

async function readCached(): Promise<OfficialRates | null> {
  const store = kv();
  if (!store) return null;
  const raw = (await store.get(CACHE_KEY, "json")) as OfficialRates | null;
  if (!raw || !Array.isArray(raw.monotributo) || raw.monotributo.length !== 11) return null;
  return raw;
}

export const tasasOficiales = createServerFn({ method: "GET" }).handler(async () => {
  const cached = await readCached();
  const freshEnough = cached?.fetchedAt && Date.now() - Date.parse(cached.fetchedAt) < MAX_AGE_MS;
  if (cached && freshEnough) return cached;
  const refreshed = await refreshOfficialRates().catch(() => null);
  return refreshed ?? cached ?? fallbackRates();
});
