import { createServerFn } from "@tanstack/react-start";

/** IPC nivel general nacional, base diciembre 2016 = 100. Serie pública del INDEC. */
const IPC_SERIES = "148.3_INIVELNAL_DICI_M_26";
const SERIES_URL = "https://apis.datos.gob.ar/series/api/series/";
const CATALOG_URL = "https://api.indec.gob.ar/v1/ipc_nacional";

export type IpcPoint = {
  date: string;
  label: string;
  index: number;
  monthly: number;
};

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function labelOf(iso: string) {
  const [year, month] = iso.slice(0, 7).split("-");
  const name = MONTHS[Number(month) - 1] ?? month;
  return `${name} ${year}`;
}

function indecToken() {
  const fromProcess = typeof process !== "undefined" ? process.env.INDEC_API_TOKEN?.trim() : "";
  const bag = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const bound = bag?.INDEC_API_TOKEN;
  const raw = fromProcess || (typeof bound === "string" ? bound.trim() : "");
  return raw.replace(/^Bearer\s+/i, "").trim();
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function pointsFromIndex(rows: { date: string; index: number }[]): IpcPoint[] {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  const points: IpcPoint[] = [];
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1].index;
    const cur = sorted[i].index;
    if (!prev) continue;
    points.push({
      date: sorted[i].date,
      label: labelOf(sorted[i].date),
      index: round2(cur),
      monthly: round2(((cur - prev) / prev) * 100),
    });
  }
  return points.slice(-12);
}

async function fromOpenSeries(): Promise<IpcPoint[]> {
  const params = new URLSearchParams({
    ids: IPC_SERIES,
    limit: "13",
    sort: "desc",
    format: "json",
    metadata: "none",
  });
  const res = await fetch(`${SERIES_URL}?${params}`);
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: [string, number][] };
  const rows = Array.isArray(json.data)
    ? json.data
        .filter((row) => typeof row[1] === "number")
        .map(([date, index]) => ({ date, index }))
    : [];
  return pointsFromIndex(rows);
}

function num(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const n = Number(value.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const MONTH_NUM: Record<string, string> = {
  enero: "01",
  febrero: "02",
  marzo: "03",
  abril: "04",
  mayo: "05",
  junio: "06",
  julio: "07",
  agosto: "08",
  septiembre: "09",
  setiembre: "09",
  octubre: "10",
  noviembre: "11",
  diciembre: "12",
};

function dateOf(row: Record<string, unknown>) {
  const periodo = String(row.periodo ?? "");
  const compact = periodo.match(/^(\d{4})(\d{2})$/);
  if (compact) return `${compact[1]}-${compact[2]}-01`;
  if (/^\d{4}-\d{2}/.test(periodo)) return periodo.slice(0, 10);
  const year = String(row.anio ?? "");
  const rawMonth = String(row.mes ?? "").trim().toLowerCase();
  const month = MONTH_NUM[rawMonth] ?? (/^\d{1,2}$/.test(rawMonth) ? rawMonth.padStart(2, "0") : "");
  if (!/^\d{4}$/.test(year) || !/^(0[1-9]|1[0-2])$/.test(month)) return "";
  return `${year}-${month}-01`;
}

function isNational(row: Record<string, unknown>) {
  return /nacional/i.test(String(row.region ?? ""));
}

function isHeadline(row: Record<string, unknown>) {
  const text = `${row.descripcion ?? ""} ${row.nivel ?? ""} ${row.codigo ?? ""}`;
  return /nivel general/i.test(text) || String(row.codigo ?? "") === "0";
}

function isIndex(row: Record<string, unknown>) {
  const kind = `${row.tipo_de_indicador ?? ""} ${row.tipo_de_indicador_descripcion ?? ""} ${row.indicador ?? ""} ${row.unidad_de_medida ?? ""}`;
  if (/variaci|intermensual|interanual|acumulad|incidencia|%/i.test(kind)) return false;
  return /[ií]ndice/i.test(kind) || !/variaci/i.test(kind);
}

function isMonthlyChange(row: Record<string, unknown>) {
  const kind = `${row.tipo_de_indicador ?? ""} ${row.tipo_de_indicador_descripcion ?? ""} ${row.indicador ?? ""}`;
  return /intermensual|mensual/i.test(kind) && /variaci/i.test(kind);
}

type CatalogResult = { status: number; rows: Record<string, unknown>[] };

async function catalogQuery(token: string, filters: Record<string, string>): Promise<CatalogResult> {
  const params = new URLSearchParams({
    select: "periodo,anio,mes,descripcion,nivel,codigo,region,indicador,tipo_de_indicador,tipo_de_indicador_descripcion,unidad_de_medida,valor",
    order: "periodo.desc",
    limit: "1000",
    offset: "0",
    ...filters,
  });
  const res = await fetch(`${CATALOG_URL}?${params}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) return { status: res.status, rows: [] };
  const rows = (await res.json()) as unknown;
  return { status: res.status, rows: Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [] };
}

function pointsFromCatalogRows(rows: Record<string, unknown>[]): IpcPoint[] {
  const national = rows.filter(isNational);
  const pool = national.length > 0 ? national : rows;
  const headline = pool.filter(isHeadline);
  const base = headline.length > 0 ? headline : pool;
  const indexes = base
    .filter(isIndex)
    .map((row) => ({ date: dateOf(row), index: num(row.valor) }))
    .filter((row): row is { date: string; index: number } => Boolean(row.date) && row.index != null);
  const fromIndex = pointsFromIndex(indexes);
  if (fromIndex.length >= 2) return fromIndex;
  const changes = base.filter(isMonthlyChange);
  const seen = new Set<string>();
  const points: IpcPoint[] = [];
  for (const row of changes) {
    const date = dateOf(row);
    const monthly = num(row.valor);
    if (!date || monthly == null || seen.has(date)) continue;
    seen.add(date);
    points.push({ date, label: labelOf(date), index: 0, monthly: round2(monthly) });
  }
  return points.sort((a, b) => a.date.localeCompare(b.date)).slice(-12);
}

async function fromCatalog(token: string): Promise<{ status: number; points: IpcPoint[] }> {
  const strict = await catalogQuery(token, {
    descripcion: "ilike.*nivel general*",
    region: "ilike.*nacional*",
  });
  if (strict.status === 401 || strict.status === 403) return { status: strict.status, points: [] };
  const strictPoints = pointsFromCatalogRows(strict.rows);
  if (strictPoints.length >= 2) return { status: strict.status, points: strictPoints };
  const broad = await catalogQuery(token, { descripcion: "ilike.*nivel general*" });
  return { status: broad.status, points: pointsFromCatalogRows(broad.rows) };
}

export const ipcReciente = createServerFn({ method: "GET" }).handler(async () => {
  const token = indecToken();
  const catalog = token ? await fromCatalog(token).catch(() => ({ status: 0, points: [] as IpcPoint[] })) : null;
  const fromToken = catalog?.points ?? [];
  const points = fromToken.length >= 2 ? fromToken : await fromOpenSeries().catch(() => []);
  const rejected = Boolean(token) && (catalog?.status === 401 || catalog?.status === 403);
  return {
    ok: points.length > 0,
    points,
    source:
      fromToken.length >= 2
        ? "INDEC, catálogo API ipc_nacional."
        : rejected
          ? "El token INDEC_API_TOKEN fue rechazado. Serie abierta del INDEC en apis.datos.gob.ar."
          : "INDEC, IPC nivel general nacional. Serie 148.3_INIVELNAL_DICI_M_26 en apis.datos.gob.ar.",
    note: "La variación mensual compara el índice de un mes con el del mes anterior (base diciembre 2016 = 100).",
  };
});

export type IpcLevel = { date: string; label: string; index: number };

function levelsFromRows(rows: Record<string, unknown>[]): IpcLevel[] {
  const national = rows.filter(isNational);
  const pool = national.length > 0 ? national : rows;
  const headline = pool.filter(isHeadline);
  const base = (headline.length > 0 ? headline : pool).filter(isIndex);
  const byMonth = new Map<string, number>();
  for (const row of base) {
    const date = dateOf(row);
    const index = num(row.valor);
    if (!date || index == null) continue;
    byMonth.set(date.slice(0, 7), index);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, index]) => ({ date: `${ym}-01`, label: labelOf(`${ym}-01`), index: round2(index) }));
}

async function openLevels(): Promise<IpcLevel[]> {
  const params = new URLSearchParams({
    ids: IPC_SERIES,
    limit: "300",
    sort: "asc",
    format: "json",
    metadata: "none",
  });
  const res = await fetch(`${SERIES_URL}?${params}`);
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: [string, number][] };
  const byMonth = new Map<string, number>();
  for (const row of json.data ?? []) {
    if (typeof row[1] !== "number") continue;
    byMonth.set(String(row[0]).slice(0, 7), row[1]);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, index]) => ({ date: `${ym}-01`, label: labelOf(`${ym}-01`), index: round2(index) }));
}

export const ipcHistoria = createServerFn({ method: "GET" }).handler(async () => {
  const token = indecToken();
  let levels: IpcLevel[] = [];
  let source = "INDEC, IPC nivel general nacional. Serie 148.3_INIVELNAL_DICI_M_26 en apis.datos.gob.ar.";
  if (token) {
    const strict = await catalogQuery(token, {
      descripcion: "ilike.*nivel general*",
      region: "ilike.*nacional*",
    }).catch(() => ({ status: 0, rows: [] as Record<string, unknown>[] }));
    levels = levelsFromRows(strict.rows);
    if (levels.length < 2 && strict.status !== 401 && strict.status !== 403) {
      const broad = await catalogQuery(token, { descripcion: "ilike.*nivel general*" }).catch(() => ({
        status: 0,
        rows: [] as Record<string, unknown>[],
      }));
      levels = levelsFromRows(broad.rows);
    }
    if (levels.length >= 2) source = "INDEC, catálogo API ipc_nacional.";
  }
  if (levels.length < 2) {
    levels = await openLevels().catch(() => []);
  }
  return { ok: levels.length >= 2, points: levels, source };
});
