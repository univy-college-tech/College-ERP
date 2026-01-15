import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    code?: string;
    details?: Record<string, unknown>;
}

export function errorHandler(
    err: AppError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    console.error(`[ERROR] ${statusCode} - ${message}`, {
        path: req.path,
        method: req.method,
        error: err,
    });

    res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message,
            ...(process.env.NODE_ENV === 'development' && {
                details: err.details,
                stack: err.stack,
            }),
        },
        meta: {
            timestamp: new Date().toISOString(),
            path: req.path,
        },
    });
}
