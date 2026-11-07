import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { tasasOficiales, type OfficialRates } from "@/lib/official-rates";
import { MONOTRIBUTO, RATES } from "@/lib/rates";

const Revision = createContext(0);

export function applyOfficial(data: OfficialRates) {
  RATES.vigencia = data.vigencia;
  RATES.smvm = data.smvm;
  RATES.horaSmvm = data.horaSmvm;
  RATES.monoVigencia = data.monoVigencia;
  MONOTRIBUTO.splice(0, MONOTRIBUTO.length, ...data.monotributo.map((row) => ({ ...row })));
}

export function RatesLive({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let live = true;
    tasasOficiales()
      .then((data) => {
        if (!live || !data) return;
        applyOfficial(data);
        setRevision((n) => n + 1);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);
  return <Revision.Provider value={revision}>{children}</Revision.Provider>;
}

export function useRatesRevision() {
  return useContext(Revision);
}
