import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Alert from '@codegouvfr/react-dsfr/Alert';

type SnackbarPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
type AlertSeverity = 'success' | 'error' | 'warning' | 'info';

interface SnackbarProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  severity?: AlertSeverity;
  position?: SnackbarPosition;
  autoHideDuration?: number;
  closable?: boolean;
}

const getPositionStyles = (position: SnackbarPosition): React.CSSProperties => {
  const positions: Record<SnackbarPosition, React.CSSProperties> = {
    'top-left': { top: 16, left: 16 },
    'top-center': { top: 16, left: '50%', transform: 'translateX(-50%)' },
    'top-right': { top: 16, right: 16 },
    'bottom-left': { bottom: 16, left: 16 },
    'bottom-right': { bottom: 16, right: 16 },
    'bottom-center': { bottom: 16, left: '50%', transform: 'translateX(-50%)' }
  };
  
  return positions[position];
};

const getAnimationVariants = (position: SnackbarPosition) => {
  const isTop = position.startsWith('top');
  const isBottom = position.startsWith('bottom');
  const isLeft = position.includes('left');
  const isRight = position.includes('right');
  
  let initial = {};
  let exit = {};

  if (isLeft) {
    initial = { x: -100 };
    exit = { x: -100 };
  } else if (isRight) {
    initial = { x: 100 };
    exit = { x: 100 };
  } else if (isTop) {
    initial = { y: -100 };
    exit = { y: -100 };
  } else if (isBottom) {
    initial = { y: 100 };
    exit = { y: 100 };
  }
  
  return {
    initial: { 
      opacity: 0,
      ...initial
    },
    animate: { 
      opacity: 1,
      x: 0,
      y: 0
    },
    exit: { 
      opacity: 0,
      ...exit
    }
  };
};

/**
 * Snackbar component that wraps the DSFR Alert component with positioning and animations
 */
const Snackbar: React.FC<SnackbarProps> = ({
  open,
  onClose,
  title,
  description,
  severity = 'info',
  position = 'top-right',
  autoHideDuration = 5000,
  closable = true
}) => {
  useEffect(() => {
    if (open && autoHideDuration) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [open, onClose, autoHideDuration]);

  const positionStyles = getPositionStyles(position);
  const animationVariants = getAnimationVariants(position);
  
  const snackbarId = React.useMemo(() => 
    `snackbar-${severity}-${Math.random().toString(36).substring(2, 9)}`,
    [severity]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id={snackbarId}
          role="status"
          aria-live="polite"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={animationVariants}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            position: 'fixed',
            zIndex: 9999,
            maxWidth: '500px',
            width: 'fit-content',
            ...positionStyles
          }}
        >
          <Alert
            severity={severity}
            title={title||""}
            description={description}
            closable={true}
            onClose={onClose}
            className="m-0 bg-white"
            small={false}
            data-testid={`snackbar-alert-${severity}`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Snackbar;