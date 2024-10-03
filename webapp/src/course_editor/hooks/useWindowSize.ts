import { useBreakpointsValuesPx } from '@codegouvfr/react-dsfr/useBreakpointsValuesPx';
import { useEffect, useState } from 'react';

const useWindowSize = () => {
  const { breakpointsValues } = useBreakpointsValuesPx();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWidth(window.innerWidth);

      const handleResize = () => {
        setWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return {
    width,
    isMobile: width < breakpointsValues.sm,
    isTablet: width < breakpointsValues.lg,
  };
};

export default useWindowSize;