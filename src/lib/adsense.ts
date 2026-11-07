/** Public AdSense publisher id. Override at build time with VITE_ADSENSE_CLIENT. */
export const ADSENSE_CLIENT =
  (import.meta.env.VITE_ADSENSE_CLIENT as string | undefined)?.trim() ||
  "ca-pub-2091064770384589";

export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`;
