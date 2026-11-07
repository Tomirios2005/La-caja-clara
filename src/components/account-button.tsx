import { useEffect, useRef, useState } from "react";
import { accountState, signInGoogle, signOutGoogle } from "@/lib/account.functions";
import { grantEntitlement, readReceipts } from "@/lib/entitlements";
import { claimReceipts } from "@/lib/mp.functions";

type GoogleAccounts = {
  accounts: {
    id: {
      initialize: (opts: { client_id: string; callback: (resp: { credential: string }) => void }) => void;
      renderButton: (el: HTMLElement, opts: Record<string, string>) => void;
    };
  };
};

export function AccountButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [clientId, setClientId] = useState("");
  const [note, setNote] = useState("");
  const slot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    accountState()
      .then((state) => {
        setClientId(state.clientId);
        setEmail(state.email);
        for (const id of state.products) grantEntitlement(id);
      })
      .catch(() => setClientId(""));
  }, []);

  useEffect(() => {
    if (!open || !clientId || email) return;
    let cancel = false;
    const win = window as Window & { google?: GoogleAccounts };
    function render() {
      if (cancel || !slot.current || !win.google) return;
      slot.current.replaceChildren();
      win.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp) => {
          signInGoogle({ data: { credential: resp.credential } })
            .then(async (res) => {
              if (!res.ok) {
                setNote(
                  res.reason === "missing_client"
                    ? "Falta GOOGLE_CLIENT_ID en Cloudflare."
                    : "Google no aceptó el ingreso.",
                );
                return;
              }
              setEmail(res.email);
              for (const id of res.products) grantEntitlement(id);
              const receipts = readReceipts().map((row) => row.paymentId);
              if (receipts.length) {
                const claimed = await claimReceipts({ data: { paymentIds: receipts } });
                for (const id of claimed.products) grantEntitlement(id);
              }
              setOpen(false);
            })
            .catch(() => setNote("No se pudo entrar."));
        },
      });
      win.google.accounts.id.renderButton(slot.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
        width: "240",
      });
    }
    if (win.google) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
    return () => {
      cancel = true;
    };
  }, [open, clientId, email]);

  return (
    <div className="relative">
      <button type="button" className="min-h-11 text-sm text-muted hover:text-ink" onClick={() => setOpen((v) => !v)}>
        {email ? email.split("@")[0] : "Entrar"}
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-lg border border-line bg-surface p-4 shadow-sm">
          {email ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">
                Sesión de <span className="font-medium">{email}</span>. Las compras confirmadas se guardan en esta
                cuenta y sacan los avisos de Caja Pro en cualquier navegador donde entres.
              </p>
              <button
                type="button"
                className="min-h-11 text-sm text-brass"
                onClick={() => {
                  signOutGoogle()
                    .then(() => {
                      setEmail("");
                      setOpen(false);
                    })
                    .catch(() => setNote("No se pudo salir."));
                }}
              >
                Salir
              </button>
            </div>
          ) : clientId ? (
            <div ref={slot} />
          ) : (
            <p className="text-sm leading-relaxed text-muted">
              El ingreso con Google se prende con el secreto GOOGLE_CLIENT_ID en Cloudflare.
            </p>
          )}
          {note ? <p className="mt-2 text-sm text-bad">{note}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
