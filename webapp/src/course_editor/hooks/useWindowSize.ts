import { useBreakpointsValuesPx } from '@codegouvfr/react-dsfr/useBreakpointsValuesPx';
import { useEffect, useState } from 'react';

const useWindowSize = () => {
  const { breakpointsValues } = useBreakpointsValuesPx();
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Nettoyage de l'événement lors du démontage du composant
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    width,
    isMobile: width < breakpointsValues.sm,
    isTablet: width < breakpointsValues.lg,
  };
};

export default useWindowSize;