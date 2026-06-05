import {Response ,Request, RequestHandler,NextFunction} from 'express';
const tryCatch = (handler: RequestHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (error: any) {
            console.error('Unhandled error in request handler:', error);
            res.status(500).json({ error: error.message || 'Internal Server Error', stack: error.stack });
        }
    };
};

export default tryCatch;