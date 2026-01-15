import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

export interface ToastProps {
    id: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onClose: (id: string) => void;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastProps['type'], duration?: number) => void;
    hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Individual toast component
 */
export function Toast({ id, message, type = 'info', onClose }: ToastProps) {
    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
    };

    const colors = {
        success: 'bg-success/20 border-success/30 text-success',
        error: 'bg-error/20 border-error/30 text-error',
        warning: 'bg-warning/20 border-warning/30 text-warning',
        info: 'bg-info/20 border-info/30 text-info',
    };

    return (
        <div
            className={cn(
                'flex items-center gap-3',
                'px-4 py-3',
                'bg-bg-secondary/95 backdrop-blur-xl',
                'border rounded-lg',
                colors[type],
                'shadow-lg',
                'animate-in slide-in-from-right fade-in duration-300'
            )}
            role="alert"
        >
            {icons[type]}
            <p className="flex-1 text-sm text-text-primary">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Dismiss"
            >
                <X className="w-4 h-4 text-text-secondary" />
            </button>
        </div>
    );
}

/**
 * Toast container component
 */
export function ToastContainer({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Array<Omit<ToastProps, 'onClose'>>>([]);

    const showToast = useCallback(
        (message: string, type: ToastProps['type'] = 'info', duration = 5000) => {
            const id = Math.random().toString(36).slice(2, 9);
            setToasts((prev) => [...prev, { id, message, type, duration }]);

            if (duration > 0) {
                setTimeout(() => {
                    setToasts((prev) => prev.filter((t) => t.id !== id));
                }, duration);
            }
        },
        []
    );

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}

            {/* Toast container */}
            {toasts.length > 0 && (
                <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
                    {toasts.map((toast) => (
                        <Toast key={toast.id} {...toast} onClose={hideToast} />
                    ))}
                </div>
            )}
        </ToastContext.Provider>
    );
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastContainer');
    }
    return context;
}
