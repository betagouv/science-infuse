import Router from 'next/router';
import { useEffect } from 'react';

const useWarnIfUnsavedChanges = (unsavedChanges: boolean, callback?: () => void) => {
  // console.log("useWarnIfUnsavedChanges")
  useEffect(() => {
    const routeChangeStart = (url: string) => {
      if (unsavedChanges) {
        callback && callback()
        const confirmationMessage = 'You have unsaved changes. Are you sure you want to leave?';
        if (window.confirm(confirmationMessage)) {
          return;
        }
        Router.events.emit('routeChangeError');
        throw 'routeChange aborted';
      }
    };

    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    Router.events.on('routeChangeStart', routeChangeStart);
    window.addEventListener('beforeunload', beforeUnload);

    return () => {
      Router.events.off('routeChangeStart', routeChangeStart);
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [unsavedChanges]);
};

export default useWarnIfUnsavedChanges;