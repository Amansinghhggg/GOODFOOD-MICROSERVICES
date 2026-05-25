const tryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    };
};
export default tryCatch;
