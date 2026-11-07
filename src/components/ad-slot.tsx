import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ADSENSE_CLIENT } from "@/lib/adsense";
import { useEntitlements } from "@/lib/entitlements";

type AdsWindow = Window & { adsbygoogle?: Record<string, unknown>[] };

const HOUSE = [
  {
    id: "presupuesto",
    kicker: "Para cobrar un trabajo",
    title: "Un presupuesto con tu nombre, listo para pasar.",
    href: "/producto/$slug",
    slug: "presupuesto",
  },
  {
    id: "plan",
    kicker: "Para el año",
    title: "Doce meses de gastos, con la inflación adentro.",
    href: "/producto/$slug",
    slug: "plan",
  },
  {
    id: "pro",
    kicker: "Sin avisos",
    title: "Caja Pro saca la publicidad y abre las dos herramientas.",
    href: "/producto/$slug",
    slug: "pro",
  },
] as const;

export function AdSlot({ slot = 0 }: { slot?: number }) {
  const { pro } = useEntitlements();
  const client = ADSENSE_CLIENT;
  const adSlot = import.meta.env.VITE_ADSENSE_SLOT as string | undefined;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (ready && pro) return null;

  if (client && adSlot) {
    return <Adsense client={client} adSlot={adSlot} />;
  }

  const house = HOUSE[Math.abs(slot) % HOUSE.length] ?? HOUSE[0];
  return (
    <aside className="no-print rounded-lg border border-line bg-surface p-4" aria-label="Aviso">
      <p className="text-xs uppercase tracking-widest text-muted">Aviso</p>
      <p className="mt-2 text-xs uppercase tracking-widest text-brass">{house.kicker}</p>
      <p className="mt-1 font-serif text-xl leading-snug">{house.title}</p>
      <Link
        to={house.href}
        params={{ slug: house.slug }}
        className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-brass"
      >
        Ver en la tienda
      </Link>
    </aside>
  );
}

function Adsense({ client, adSlot }: { client: string; adSlot: string }) {
  useEffect(() => {
    const id = "adsense-script";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.async = true;
      s.crossOrigin = "anonymous";
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
      document.head.appendChild(s);
    }
    try {
      const w = window as AdsWindow;
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      /* el script avisa si el slot ya se pidió */
    }
  }, [client]);

  return (
    <aside className="no-print" aria-label="Publicidad">
      <p className="mb-1 text-xs uppercase tracking-widest text-muted">Publicidad</p>
      <ins
        className="adsbygoogle block min-h-24"
        data-ad-client={client}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
