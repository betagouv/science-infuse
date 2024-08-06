import React, { createContext, useState, useContext } from 'react';

export type TSeverity = 'success' | 'info' | 'warning' | 'error';

interface SnackbarContextType {
    snackbar: {
        open: boolean;
        message: string;
        severity: TSeverity;
    };

    showSnackbar: (message: string, severity: TSeverity) => void;
    hideSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

interface SnackbarProviderProps {
    children: React.ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as TSeverity });

    const showSnackbar = (message: string, severity: TSeverity) => {
        setSnackbar({ open: true, message, severity });
    };

    const hideSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <SnackbarContext.Provider value={{ snackbar, showSnackbar, hideSnackbar }}>
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