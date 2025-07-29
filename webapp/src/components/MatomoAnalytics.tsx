'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { init, push } from '@socialgouv/matomo-next';

const MatomoAnalytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const matomoUrl = process.env.NEXT_PUBLIC_MATOMO_URL;
  const matomoSiteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
  
  // Keep track of the last tracked URL to prevent duplicates
  const lastTrackedUrl = useRef<string>('');
  const trackingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!matomoUrl || !matomoSiteId) {
      console.warn('Matomo URL or Site ID not configured');
      return;
    }

    // Initialize Matomo
    init({
      url: matomoUrl,
      siteId: matomoSiteId,
    });
  }, [matomoUrl, matomoSiteId]);

  // Track page views on route changes
  useEffect(() => {
    if (!matomoUrl || !matomoSiteId) {
      return;
    }

    // Construct the current URL
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Clear any existing timeout
    if (trackingTimeoutRef.current) {
      clearTimeout(trackingTimeoutRef.current);
    }
    
    // Set a small delay to debounce rapid changes
    trackingTimeoutRef.current = setTimeout(() => {
      // Only track if the URL has actually changed
      if (url !== lastTrackedUrl.current) {
        lastTrackedUrl.current = url;
        
        // Push the page view to Matomo
        push(['setCustomUrl', url]);
        push(['trackPageView']);
        
        console.log('Matomo: Tracking page view for', url);
      }
    }, 100); // 100ms debounce
    
    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (trackingTimeoutRef.current) {
        clearTimeout(trackingTimeoutRef.current);
      }
    };
  }, [pathname, searchParams, matomoUrl, matomoSiteId]);

  // This component doesn't render anything
  return null;
};

export default MatomoAnalytics;