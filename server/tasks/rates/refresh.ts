import { defineTask } from "nitro/task";
import { refreshOfficialRates } from "../../../src/lib/official-rates";

export default defineTask({
  meta: {
    name: "rates:refresh",
    description: "Lee el SMVM oficial y el cuadro de monotributo de ARCA",
  },
  async run() {
    const rates = await refreshOfficialRates();
    return { result: { ok: Boolean(rates), vigencia: rates?.vigencia ?? "", mono: rates?.monoVigencia ?? "" } };
  },
});
