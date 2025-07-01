'use client';

import Script from 'next/script';
import React from 'react';

const MatomoAnalytics = () => {
  const matomoUrl = process.env.NEXT_PUBLIC_MATOMO_URL;
  const matomoSiteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

  if (!matomoUrl || !matomoSiteId) {
    return null;
  }

  return (
    <>
      <Script id="matomo-analytics" strategy="lazyOnload">
        {`
          var _paq = window._paq = window._paq || [];
          /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
          _paq.push(['trackPageView']);
          _paq.push(['enableLinkTracking']);
          (function() {
            var u = "${matomoUrl}";
            _paq.push(['setTrackerUrl', u + 'matomo.php']);
            _paq.push(['setSiteId', '${matomoSiteId}']);
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
          })();
        `}
      </Script>
    </>
  );
};

export default MatomoAnalytics;
