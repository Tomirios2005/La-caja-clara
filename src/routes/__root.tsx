import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { ADSENSE_SCRIPT_SRC } from "@/lib/adsense";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Calculadora de sueldo neto, aguinaldo y monotributo — Caja Clara" },
      {
        name: "description",
        content:
          "Calculá el sueldo neto, el aguinaldo, el alquiler, la inflación del IPC y la categoría de monotributo en Argentina.",
      },
      {
        name: "keywords",
        content:
          "calculadora sueldo neto, sueldo bruto a neto, calculadora aguinaldo, calculadora monotributo, calculadora alquiler, IPC INDEC, tarifa freelance, Argentina",
      },
      { name: "theme-color", content: "#f3efe6" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon-48.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192.png" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Caja Clara",
          url: "https://lacajaclara.com.ar/",
          logo: "https://lacajaclara.com.ar/logo.png",
        }),
      },
      {
        id: "adsense-script",
        async: true,
        src: ADSENSE_SCRIPT_SRC,
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: () => (
    <html lang="es" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
