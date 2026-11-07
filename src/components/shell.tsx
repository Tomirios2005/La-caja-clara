import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccountButton } from "@/components/account-button";
import { LogoMark } from "@/components/logo";
import { RatesLive } from "@/components/rates-live";

const CALCULATORS = [
  { to: "/sueldo", label: "Sueldo neto", hint: "Del bruto a la mano" },
  { to: "/aguinaldo", label: "Aguinaldo", hint: "SAC del semestre" },
  { to: "/alquiler", label: "Alquiler", hint: "Aumento y peso del neto" },
  { to: "/inflacion", label: "Inflación", hint: "IPC y plata que vas a necesitar" },
  { to: "/monotributo", label: "Monotributo", hint: "Categoría y cuota" },
  { to: "/freelance", label: "Tarifa freelance", hint: "La hora para llegar a un neto" },
  { to: "/comparar", label: "Comparar ofertas", hint: "Cuál laburo deja más" },
] as const;

const LINKS = [
  { to: "/tienda", label: "Tienda", match: (path: string) => path === "/tienda" || path.startsWith("/producto/") },
  { to: "/guias", label: "Guías", match: (path: string) => path === "/guias" || path.startsWith("/guia/") },
] as const;

function calcActive(path: string) {
  return CALCULATORS.some((item) => item.to === path);
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <RatesLive>
      <div className="min-h-screen bg-bg text-ink">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </RatesLive>
  );
}

function Header() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <header className="no-print sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark className="size-9" />
          <span className="font-serif text-xl leading-none">Caja Clara</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          <CalcMenu path={path} />
          {LINKS.map((item) => (
            <TopLink key={item.to} to={item.to} active={item.match(path)}>
              {item.label}
            </TopLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <AccountButton />
          <button
            type="button"
            className="grid size-11 place-items-center rounded-lg border border-line md:hidden"
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-line px-4 py-3 md:hidden" aria-label="Principal">
          <p className="px-2 text-xs font-medium uppercase tracking-widest text-muted">Calculadoras</p>
          <div className="mt-1">
            {CALCULATORS.map((item) => (
              <MobileLink key={item.to} to={item.to} active={item.to === path} hint={item.hint}>
                {item.label}
              </MobileLink>
            ))}
          </div>
          <p className="mt-4 px-2 text-xs font-medium uppercase tracking-widest text-muted">Sitio</p>
          <div className="mt-1">
            {LINKS.map((item) => (
              <MobileLink key={item.to} to={item.to} active={item.match(path)}>
                {item.label}
              </MobileLink>
            ))}
            <MobileLink to="/contacto" active={path === "/contacto"}>
              Contacto
            </MobileLink>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function TopLink({ to, active, children }: { to: "/tienda" | "/guias"; active: boolean; children: ReactNode }) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`rounded-md px-3 py-2 text-sm ${active ? "bg-bg font-medium text-brass" : "text-muted hover:bg-bg hover:text-ink"}`}
    >
      {children}
    </Link>
  );
}

function CalcMenu({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = calcActive(path);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={`inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-sm ${active ? "bg-bg font-medium text-brass" : "text-muted hover:bg-bg hover:text-ink"}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        Calculadoras
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="menu-panel absolute left-0 top-full z-30 mt-2 w-80 rounded-lg border border-line bg-surface p-2">
          {CALCULATORS.map((item) => {
            const current = item.to === path;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={current ? "page" : undefined}
                className={`block rounded-md px-3 py-2 ${current ? "bg-bg" : "hover:bg-bg"}`}
                onClick={() => setOpen(false)}
              >
                <span className={`block text-sm font-medium ${current ? "text-brass" : ""}`}>{item.label}</span>
                <span className="block text-sm text-muted">{item.hint}</span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function MobileLink({
  to,
  active,
  hint,
  children,
}: {
  to: "/sueldo" | "/aguinaldo" | "/alquiler" | "/inflacion" | "/monotributo" | "/freelance" | "/comparar" | "/tienda" | "/guias" | "/contacto";
  active: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`block rounded-md px-2 py-2.5 ${active ? "bg-bg" : ""}`}
    >
      <span className={`block text-base ${active ? "font-medium text-brass" : ""}`}>{children}</span>
      {hint ? <span className="block text-sm text-muted">{hint}</span> : null}
    </Link>
  );
}

function Footer() {
  return (
    <footer className="no-print mt-16 border-t border-line">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 text-sm md:grid-cols-3 md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <LogoMark className="size-8" />
            <p className="font-serif text-lg">Caja Clara</p>
          </div>
          <p className="mt-2 leading-relaxed text-muted">
            Números de todos los días para Argentina. Las cuentas son estimaciones con alícuotas públicas, no un
            recibo ni un consejo de contador.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted">Calculadoras</p>
          <div className="mt-3 flex flex-col gap-2">
            {CALCULATORS.map((item) => (
              <Link key={item.to} to={item.to} className="text-muted hover:text-ink">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted">Sitio</p>
          <div className="mt-3 flex flex-col gap-2">
            <Link to="/tienda" className="text-muted hover:text-ink">
              Tienda
            </Link>
            <Link to="/guias" className="text-muted hover:text-ink">
              Guías
            </Link>
            <Link to="/nosotros" className="text-muted hover:text-ink">
              Quiénes somos
            </Link>
            <Link to="/contacto" className="text-muted hover:text-ink">
              Contacto
            </Link>
            <Link to="/legal" className="text-muted hover:text-ink">
              Aviso y fuentes
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
