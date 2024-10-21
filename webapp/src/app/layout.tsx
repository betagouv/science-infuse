import "./css/globals.css";
import "./css/lists.scss";

import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { getHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes";
import { NextAppDirEmotionCacheProvider } from "tss-react/next";
import { defaultColorScheme } from "./defaultColorScheme";
import { Providers } from "./providers";
// import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import MatomoAnalytics from "@/components/MatomoAnalytics";
import SIFooter from "@/components/SIFooter";
import SIHeader from "@/components/header/SIHeader";
import { catchErrorTyped } from "@/errors";
import { addDisplayTranslations, headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { cx } from '@codegouvfr/react-dsfr/tools/cx';
import { getServerSession } from "next-auth";
import { getScriptNonceFromHeader } from "next/dist/server/app-render/get-script-nonce-from-header"; // or use your own implementation
import { headers } from "next/headers";
import Link from "next/link";
import { MuiDsfrThemeProvider } from "./MuiDsfrThemeProvider";
import StartDsfr from "./StartDsfr";
import { authOptions } from "./api/auth/[...nextauth]/authOptions";
import { ConsentBannerAndConsentManagement, FooterConsentManagementItem, FooterPersonalDataPolicyItem } from "./consentManagement";
import style from "./main.module.css";

export default async function RootLayout({ children }: { children: JSX.Element; }) {
  const csp = headers().get("Content-Security-Policy");
  const session = await getServerSession(authOptions);
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
        <title>Science Infuse</title>
        {process.env.ENVIRONMENT != "dev" && <MatomoAnalytics />}
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
                <SIHeader session={session} />
                <div className={cx(style.container)}>
                  {children}
                </div>
                <SIFooter />
                <Footer
                  accessibility="partially compliant"
                  contentDescription={`
                `}
                  bottomItems={[
                    headerFooterDisplayItem,
                    <FooterPersonalDataPolicyItem key="FooterPersonalDataPolicyItem" />,
                    <FooterConsentManagementItem key="FooterConsentManagementItem" />,
                    // <ClientFooterItem key="ClientFooterItem" />
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