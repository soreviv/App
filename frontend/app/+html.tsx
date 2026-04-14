// @ts-nocheck
import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const APP_NAME = "TinnitusLibre";
const APP_DESCRIPTION =
  "Programa de habituación al tinnitus de 8 semanas basado en TCC. Reduce tu angustia, recupera tu calidad de vida y aprende a vivir sin miedo al sonido.";
const APP_URL = "https://tinnituslibre.app";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es" style={{ height: "100%" }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* Primary SEO */}
        <title>{APP_NAME} — Programa de Habituación al Tinnitus</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta
          name="keywords"
          content="tinnitus, habituación, TCC, terapia cognitivo conductual, acúfenos, pitido oídos, zumbido, tinnitus retraining therapy, TRT, mindfulness tinnitus"
        />
        <meta name="author" content={APP_NAME} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={APP_URL} />

        {/* Theme */}
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={APP_URL} />
        <meta
          property="og:title"
          content={`${APP_NAME} — Programa de Habituación al Tinnitus`}
        />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:site_name" content={APP_NAME} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${APP_NAME} — Habituación al Tinnitus`} />
        <meta name="twitter:description" content={APP_DESCRIPTION} />

        {/*
          Disable body scrolling on web to make ScrollView components work correctly.
          If you want to enable scrolling, remove `ScrollViewStyleReset` and
          set `overflow: auto` on the body style below.
        */}
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body > div:first-child { position: fixed !important; top: 0; left: 0; right: 0; bottom: 0; }
              [role="tablist"] [role="tab"] * { overflow: visible !important; }
              [role="heading"], [role="heading"] * { overflow: visible !important; }
            `,
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </body>
    </html>
  );
}
