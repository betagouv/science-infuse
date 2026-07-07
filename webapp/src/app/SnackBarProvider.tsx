import { TSeverity } from '@/types/snackbar';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface SnackbarState {
    open: boolean;
    message: React.ReactElement | string;
    severity: TSeverity;
    icon?: React.ReactElement;
}

interface SnackbarContextType {
    snackbar: SnackbarState;
    showSnackbar: (message: React.ReactElement | string, severity: TSeverity, icon?: React.ReactElement) => void;
    hideSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

interface SnackbarProviderProps {
    children: React.ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
    const [snackbar, setSnackbar] = useState<SnackbarState>({ 
        open: false, 
        message: <></>, 
        severity: 'success' as TSeverity,
        icon: undefined,
    });

    const showSnackbar = useCallback((message: React.ReactElement | string, severity: TSeverity, icon?: React.ReactElement) => {
        setSnackbar({ open: true, message: typeof message === 'string' ? <>{message}</> : message, severity, icon });
    }, []);

    const hideSnackbar = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    const providerValue = useMemo(() => ({
        snackbar,
        showSnackbar,
        hideSnackbar,
    }), [snackbar, showSnackbar, hideSnackbar]);

    return (
        <SnackbarContext.Provider value={providerValue}>
            {children}
        </SnackbarContext.Provider>
    );
};

export const useSnackbar = (): SnackbarContextType => {
    const context = useContext(SnackbarContext);
    if (context === undefined) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
};
