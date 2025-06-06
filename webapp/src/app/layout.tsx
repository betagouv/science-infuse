import "./css/globals.css";
import "./css/lists.scss";

import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { getHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes";
import { defaultColorScheme } from "./defaultColorScheme";
import MatomoAnalytics from "@/components/MatomoAnalytics";
import { catchErrorTyped } from "@/errors";
import { addDisplayTranslations } from "@codegouvfr/react-dsfr/Display";
import { getScriptNonceFromHeader } from "next/dist/server/app-render/get-script-nonce-from-header"; // or use your own implementation
import { headers } from "next/headers";
import Link from "next/link";
import StartDsfr from "./StartDsfr";
import { auth } from "@/auth";

export default async function RootLayout({ children }: { children: JSX.Element; }) {
  const csp = headers().get("Content-Security-Policy");
  const session = await auth();
  const user = session?.user

  catchErrorTyped
  let nonce: string | undefined;
  if (csp) {
    nonce = getScriptNonceFromHeader(csp);
  }

  //NOTE: If we had i18n setup we would get lang from the props.
  //See https://github.com/vercel/next.js/blob/canary/examples/app-dir-i18n-routing/app/%5Blang%5D/layout.tsx
  const lang = "fr";

  return (
    <html {...getHtmlAttributes({ defaultColorScheme, lang })} >
      <head>
        <title>Ada - Contenus multimédias gratuits par la Cité des sciences et de l'industrie et le Palais de la découverte</title>
        {process.env.ENVIRONMENT != "dev" && <MatomoAnalytics />}
        <StartDsfr />
        <DsfrHead
          Link={Link}
          preloadFonts={[
            "Marianne-Regular",
            "Marianne-Medium",
            "Marianne-Bold"
          ]}
          nonce={nonce}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

addDisplayTranslations({
  "lang": "fr",
  "messages": {
    "dark theme": "Thème sombre 🤩",
  }
});