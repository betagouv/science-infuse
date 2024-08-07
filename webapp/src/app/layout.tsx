import "./css/globals.css";
import "./css/lists.scss";

import { Providers } from "./providers"
import { NextAppDirEmotionCacheProvider } from "tss-react/next";
import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { getHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes";
import { defaultColorScheme } from "./defaultColorScheme";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { headerFooterDisplayItem, addDisplayTranslations } from "@codegouvfr/react-dsfr/Display";
import { fr } from "@codegouvfr/react-dsfr";
import { Navigation } from "./Navigation";
import Link from "next/link";
import { ConsentBannerAndConsentManagement, FooterConsentManagementItem, FooterPersonalDataPolicyItem } from "./consentManagement";
import { ClientFooterItem } from "../ui/ClientFooterItem";
import { headers } from "next/headers";
import { getScriptNonceFromHeader } from "next/dist/server/app-render/get-script-nonce-from-header"; // or use your own implementation
import style from "./main.module.css";
import { cx } from '@codegouvfr/react-dsfr/tools/cx';
import { Follow } from "./Follow";
import StartDsfr from "./StartDsfr";

export default function RootLayout({ children }: { children: JSX.Element; }) {
  const csp = headers().get("Content-Security-Policy");
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
        <title>Science Infuse</title>
        <StartDsfr />
        <DsfrHead
          Link={Link}
          preloadFonts={[
            //"Marianne-Light",
            //"Marianne-Light_Italic",
            "Marianne-Regular",
            //"Marianne-Regular_Italic",
            "Marianne-Medium",
            //"Marianne-Medium_Italic",
            "Marianne-Bold"
            //"Marianne-Bold_Italic",
            //"Spectral-Regular",
            //"Spectral-ExtraBold"
          ]}
          nonce={nonce}
        />
      </head>
      <body>
        <Providers>
          <DsfrProvider lang={lang}>
            <ConsentBannerAndConsentManagement />
            <NextAppDirEmotionCacheProvider options={{ "key": "css", nonce, prepend: true }}>
              <MuiDsfrThemeProvider>
                <Header
                  brandTop={<>INTITULE<br />OFFICIEL</>}
                  serviceTitle="Science Infuse"
                  homeLinkProps={{
                    "href": "/",
                    "title": "Accueil - Science Infuse"
                  }}
                  quickAccessItems={[
                    headerFooterDisplayItem,
                    {
                      iconId: "ri-mail-line",
                      linkProps: {
                        href: `mailto:${"joseph.garrone@code.gouv.fr"}`,
                      },
                      text: "Nous contacter",
                    },
                  ]}
                  navigation={<Navigation />}
                />
                <div className={cx(style.container)}>
                  {children}
                </div>
                {/* <Follow /> */}
                <Footer
                  accessibility="fully compliant"
                  contentDescription={`
                `}
                  bottomItems={[
                    headerFooterDisplayItem,
                    <FooterPersonalDataPolicyItem key="FooterPersonalDataPolicyItem" />,
                    <FooterConsentManagementItem key="FooterConsentManagementItem" />,
                    <ClientFooterItem key="ClientFooterItem" />
                  ]}
                />
              </MuiDsfrThemeProvider>
            </NextAppDirEmotionCacheProvider>
          </DsfrProvider>
        </Providers>
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