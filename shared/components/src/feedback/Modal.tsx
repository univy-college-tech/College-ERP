import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';
import { IconButton } from '../buttons/IconButton';

export interface ModalProps {
    /** Is modal open */
    isOpen: boolean;
    /** On close callback */
    onClose: () => void;
    /** Modal title */
    title?: string;
    /** Modal description */
    description?: string;
    /** Modal content */
    children: ReactNode;
    /** Footer content (buttons) */
    footer?: ReactNode;
    /** Modal size */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Close on overlay click */
    closeOnOverlayClick?: boolean;
    /** Show close button */
    showCloseButton?: boolean;
}

/**
 * Modal/Dialog component with overlay and animations
 */
export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    closeOnOverlayClick = true,
    showCloseButton = true,
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Focus trap
    useEffect(() => {
        if (isOpen && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            firstElement?.focus();
        }
    }, [isOpen]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-[90vw] max-h-[90vh]',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={closeOnOverlayClick ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className={cn(
                    'relative w-full',
                    sizes[size],
                    'bg-bg-secondary',
                    'border border-white/10',
                    'rounded-xl',
                    'shadow-xl',
                    'animate-in zoom-in-95 fade-in duration-200'
                )}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-start justify-between gap-4 p-6 pb-0">
                        <div>
                            {title && (
                                <h2
                                    id="modal-title"
                                    className="text-lg font-semibold text-text-primary"
                                >
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="mt-1 text-sm text-text-secondary">{description}</p>
                            )}
                        </div>
                        {showCloseButton && (
                            <IconButton
                                icon={<X className="w-5 h-5" />}
                                onClick={onClose}
                                aria-label="Close modal"
                                variant="ghost"
                                size="sm"
                            />
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-6">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="flex justify-end gap-3 p-6 pt-0 border-t border-white/10 mt-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
