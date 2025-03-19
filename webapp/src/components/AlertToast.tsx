import Alert from "@codegouvfr/react-dsfr/Alert";
import toast from "react-hot-toast";
import { useEffect } from "react";

type Severity = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    severity?: Severity;
    title?: string;
    description?: string;
    duration?: number;
    style?: React.CSSProperties;
    [key: string]: any;
}

// Add this CSS to your global styles or create a style tag in your component
const injectStyles = () => {
  // Check if styles already exist to avoid duplication
  if (!document.getElementById('toast-alert-styles')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'toast-alert-styles';
    styleTag.innerHTML = `
      @keyframes toast-enter {
        0% { transform: translateY(20px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes toast-exit {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(20px); opacity: 0; }
      }
      
      .toast-alert-enter {
        animation: toast-enter 0.3s ease forwards;
      }
      
      .toast-alert-exit {
        animation: toast-exit 0.3s ease forwards;
      }
    `;
    document.head.appendChild(styleTag);
  }
};

export const useAlertToast = () => {
    // Inject animation styles when the hook is used
    useEffect(() => {
        injectStyles();
    }, []);

    const showAlert = ({
        severity = 'success',
        title = '',
        description = '',
        duration = 4000,
        ...props
    }: AlertProps) => {
        return toast.custom((t) => (
            <Alert
                className={`bg-white ${t.visible ? 'toast-alert-enter' : 'toast-alert-exit'}`}
                small
                closable
                severity={severity}
                title={title}
                description={description}
                onClose={() => toast.dismiss(t.id)}
                style={{
                    ...props.style
                }}
                {...props}
            />
        ), { 
            duration,
            // position: 'top-right',
            // Prevent automatic removal during hover
            id: `${severity}-${Date.now()}`,
        });
    };
    
    // Different severity helpers
    const success = (title: string, description: string, options: Partial<AlertProps> = {}) =>
        showAlert({ severity: 'success', title, description, ...options });

    const error = (title: string, description: string, options: Partial<AlertProps> = {}) =>
        showAlert({ severity: 'error', title, description, ...options });

    const warning = (title: string, description: string, options: Partial<AlertProps> = {}) =>
        showAlert({ severity: 'warning', title, description, ...options });

    const info = (title: string, description: string, options: Partial<AlertProps> = {}) =>
        showAlert({ severity: 'info', title, description, ...options });

    return { showAlert, success, error, warning, info };
};
