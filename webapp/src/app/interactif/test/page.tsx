'use client';

import React, { useEffect, useMemo, useState } from 'react';

import ContentListComponent from './components/ContentListComponent';
import { ContentService } from './services/ContentService';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { H5PPlayerUI } from '@lumieducation/h5p-react';
// import Login from './components/Login';


export default function Page() {

  const contentService = useMemo(() => new ContentService(process.env.NEXT_PUBLIC_H5P_URL || ""), []);
  // const [isServiceReady, setIsServiceReady] = useState(contentService.isServiceReady()); // Initial sync check
  // const [serviceError, setServiceError] = useState<string | null>(contentService.getInitializationError()?.message ?? null);

  // useEffect(() => {
  //   // If already ready or errored on initial check, do nothing more.
  //   if (isServiceReady || serviceError) {
  //     return;
  //   }

  //   let isMounted = true; // Prevent state updates on unmounted component

  //   console.log("Component attempting to wait for ContentService...");
  //   contentService.waitUntilReady()
  //     .then(() => {
  //       if (isMounted) {
  //         console.log("ContentService is ready.");
  //         setIsServiceReady(true);
  //         setServiceError(null);
  //         // Now you can make calls like contentService.fetchLibraries()
  //       }
  //     })
  //     .catch(error => {
  //       if (isMounted) {
  //         console.error("Failed to initialize ContentService:", error);
  //         setServiceError(error.message || 'Unknown initialization error');
  //         setIsServiceReady(false);
  //       }
  //     });

  //   return () => {
  //     isMounted = false; // Cleanup on unmount
  //   };
  //   // Depend on the contentService instance. If it changes (e.g., different user logs in,
  //   // creating a new instance), this effect re-runs.
  // }, [contentService, isServiceReady, serviceError]);

  // // --- Render Logic ---
  // if (serviceError) {
  //   return <Alert severity="error" title={`Error initializing H5P Service: ${serviceError}`} />;
  // }

  // if (!isServiceReady) {
  //   return (
  //     <div>
  //       {/* <Spinner animation="border" role="status" size="sm" /> */}
  //       <span className="ms-2">Initializing H5P Service...</span>
  //     </div>
  //   );
  // }


  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">H5P NodeJs SPA Demo</h1>
        </div>

        {/* <H5PPlayerUI
          // ref={playerRef}
          contentId={"2661679099"}
          contextId={"2661679099"}
          // asUserId={asUserId}
          // readOnlyState={readOnly}
          loadContentCallback={contentService.getPlay}
        // onInitialized={() => setLoading(false)}
        /> */}


        <ContentListComponent
          contentService={contentService}
        />
        {/* {isServiceReady && <ContentListComponent
          contentService={contentService}
        />} */}
      </div>
    </div>
  );
}
