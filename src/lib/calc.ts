import { MONOTRIBUTO, RATES } from "@/lib/rates";

export type SueldoInput = {
  bruto: number;
  sindicato: boolean;
  sindicatoPct: number;
  noRemunerativo: number;
};

export function calcSueldo(input: SueldoInput) {
  const bruto = Math.max(0, input.bruto);
  const base = Math.min(bruto, RATES.baseMax);
  const jubilacion = base * RATES.jubilacion;
  const pami = base * RATES.pami;
  const obraSocial = base * RATES.obraSocial;
  const sindicato = input.sindicato ? bruto * Math.max(0, input.sindicatoPct) : 0;
  const descuentos = jubilacion + pami + obraSocial + sindicato;
  const noRem = Math.max(0, input.noRemunerativo);
  const neto = bruto - descuentos + noRem;
  const costoEmpresa = bruto * (1 + RATES.contribucionPatronalAlta);
  return {
    bruto,
    base,
    topeAplicado: bruto > RATES.baseMax,
    jubilacion,
    pami,
    obraSocial,
    sindicato,
    descuentos,
    noRem,
    neto,
    costoEmpresa,
    bajoSmvm: bruto > 0 && bruto < RATES.smvm,
  };
}

export function calcAguinaldo(mejorBruto: number, meses: number) {
  const m = Math.min(6, Math.max(0, meses));
  const bruto = (Math.max(0, mejorBruto) / 2) * (m / 6);
  const neto = calcSueldo({
    bruto,
    sindicato: false,
    sindicatoPct: 0,
    noRemunerativo: 0,
  });
  return { ...neto, meses: m };
}

export function calcAlquiler(actual: number, aumentoPct: number, neto: number) {
  const nuevo = Math.max(0, actual) * (1 + aumentoPct / 100);
  const peso = neto > 0 ? (nuevo / neto) * 100 : 0;
  return { nuevo, diferencia: nuevo - Math.max(0, actual), peso };
}

export function serieInflacion(monto: number, mensualPct: number, meses: number) {
  const m = Math.min(36, Math.max(1, Math.round(meses)));
  const r = 1 + mensualPct / 100;
  const points = [];
  for (let i = 0; i <= m; i++) {
    const factor = r ** i;
    points.push({
      mes: i,
      necesario: monto * factor,
      poder: factor === 0 ? monto : monto / factor,
    });
  }
  return points;
}

export function categoriaMonotributo(anual: number, actividad: "servicios" | "bienes") {
  if (anual <= 0) return null;
  const found = MONOTRIBUTO.find((c) => anual <= c.tope);
  if (!found) {
    return { fuera: true as const, anual };
  }
  const cuota = actividad === "servicios" ? found.servicios : found.bienes;
  return {
    fuera: false as const,
    cat: found.cat,
    tope: found.tope,
    cuota,
    anual,
    margen: found.tope - anual,
  };
}
