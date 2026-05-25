const tryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (error) {
            console.error('Unhandled error in request handler:', error);
            res.status(500).json({ error: error.message || 'Internal Server Error', stack: error.stack });
        }
    };
};
export default tryCatch;
