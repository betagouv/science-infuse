import { Toaster } from 'react-hot-toast';
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { NextAppDirEmotionCacheProvider } from "tss-react/next";
import { Providers } from "../providers";
import SIFooter from "@/components/SIFooter";
import SIHeader from "@/components/header/SIHeader";
import { catchErrorTyped } from "@/errors";
import { addDisplayTranslations, headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { cx } from '@codegouvfr/react-dsfr/tools/cx';
import { getScriptNonceFromHeader } from "next/dist/server/app-render/get-script-nonce-from-header"; // or use your own implementation
import { headers } from "next/headers";
import { MuiDsfrThemeProvider } from "../MuiDsfrThemeProvider";
import { ConsentBannerAndConsentManagement, FooterConsentManagementItem, FooterPersonalDataPolicyItem } from "../../components/dsfr/consentManagement";
import { auth } from '@/auth';

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
    <Providers>
      <DsfrProvider lang={lang}>
        <ConsentBannerAndConsentManagement />
        <NextAppDirEmotionCacheProvider options={{ "key": "css", nonce, prepend: true }}>
          <MuiDsfrThemeProvider>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
              }}
            />
            <SIHeader session={session} />
            {children}
            <SIFooter />
            <Footer
              accessibility="non compliant"
              contentDescription={`
                `}
              bottomItems={[
                headerFooterDisplayItem,
                <FooterPersonalDataPolicyItem key="FooterPersonalDataPolicyItem" />,
                <FooterConsentManagementItem key="FooterConsentManagementItem" />,
              ]}
            />
          </MuiDsfrThemeProvider>
        </NextAppDirEmotionCacheProvider>
      </DsfrProvider>
    </Providers>
  );
}

addDisplayTranslations({
  "lang": "fr",
  "messages": {
    "dark theme": "Thème sombre 🤩",
  }
});