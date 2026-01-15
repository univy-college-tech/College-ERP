import { type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface TableColumn<T> {
    /** Column key */
    key: string;
    /** Column header */
    header: string;
    /** Cell renderer */
    render?: (item: T, index: number) => ReactNode;
    /** Header alignment */
    align?: 'left' | 'center' | 'right';
    /** Column width */
    width?: string;
    /** Sortable */
    sortable?: boolean;
}

export interface TableProps<T> {
    /** Table columns */
    columns: TableColumn<T>[];
    /** Table data */
    data: T[];
    /** Row key getter */
    getRowKey: (item: T, index: number) => string;
    /** On row click */
    onRowClick?: (item: T, index: number) => void;
    /** Loading state */
    isLoading?: boolean;
    /** Empty message */
    emptyMessage?: string;
    /** Additional class name */
    className?: string;
}

/**
 * Data table component
 */
export function Table<T extends Record<string, unknown>>({
    columns,
    data,
    getRowKey,
    onRowClick,
    isLoading = false,
    emptyMessage = 'No data available',
    className,
}: TableProps<T>) {
    const alignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    };

    return (
        <div
            className={cn(
                'bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95',
                'backdrop-blur-xl',
                'border border-white/10',
                'rounded-lg',
                'overflow-hidden',
                className
            )}
        >
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        'p-4',
                                        'text-text-secondary font-medium text-sm',
                                        alignClasses[column.align || 'left']
                                    )}
                                    style={{ width: column.width }}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-white/5">
                                    {columns.map((col) => (
                                        <td key={col.key} className="p-4">
                                            <div className="h-4 bg-white/5 rounded animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="p-8 text-center text-text-muted"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr
                                    key={getRowKey(item, index)}
                                    onClick={() => onRowClick?.(item, index)}
                                    className={cn(
                                        'border-b border-white/5',
                                        'transition-colors',
                                        onRowClick && 'cursor-pointer hover:bg-white/5'
                                    )}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={cn(
                                                'p-4',
                                                'text-text-primary',
                                                alignClasses[column.align || 'left']
                                            )}
                                        >
                                            {column.render
                                                ? column.render(item, index)
                                                : String(item[column.key] ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
