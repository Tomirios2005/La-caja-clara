/** Respaldo de noviembre 2026. El valor vivo sale de la serie oficial 57.1. */
export const RATES = {
  vigencia: "noviembre 2026",
  smvm: 398_800,
  horaSmvm: 1_994,
  jubilacion: 0.11,
  pami: 0.03,
  obraSocial: 0.03,
  /** Estimación de La Nación (13 oct 2026) para la base de noviembre. */
  baseMax: 4_861_685,
  contribucionPatronalAlta: 0.204,
  contribucionPatronalResto: 0.18,
  sindicatoSugerido: 0.02,
  /** Respaldo si ARCA no responde. El cuadro vivo se lee de categorias.asp. */
  monoVigencia: "1/08/2026",
};

export type MonoCat = {
  cat: string;
  tope: number;
  servicios: number;
  bienes: number;
};

/** Cuotas y topes publicados para octubre 2026 (vigentes desde agosto). */
export const MONOTRIBUTO: MonoCat[] = [
  { cat: "A", tope: 12_009_410.45, servicios: 49_527.18, bienes: 49_527.18 },
  { cat: "B", tope: 17_595_182.74, servicios: 56_379.08, bienes: 56_379.08 },
  { cat: "C", tope: 24_670_494.31, servicios: 66_020.12, bienes: 64_530.58 },
  { cat: "D", tope: 30_628_651.43, servicios: 84_612.93, bienes: 82_564.81 },
  { cat: "E", tope: 36_028_231.33, servicios: 119_811.45, bienes: 108_267.51 },
  { cat: "F", tope: 45_151_659.41, servicios: 150_784.21, bienes: 129_930.65 },
  { cat: "G", tope: 53_995_798.87, servicios: 230_312.94, bienes: 158_815.05 },
  { cat: "H", tope: 81_924_660.37, servicios: 522_706.68, bienes: 317_895.01 },
  { cat: "I", tope: 91_699_761.9, servicios: 963_747.86, bienes: 474_992.78 },
  { cat: "J", tope: 105_012_519.2, servicios: 1_167_299.76, bienes: 580_793.69 },
  { cat: "K", tope: 126_610_838.75, servicios: 1_614_446.04, bienes: 702_103.24 },
];
