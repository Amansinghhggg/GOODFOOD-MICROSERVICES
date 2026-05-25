import jwt from 'jsonwebtoken';
const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Please Login - No Auth Header' });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Please Login - No Token' });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.user) {
            res.status(401).json({ message: 'Please Login - Invalid Token' });
            return;
        }
        req.user = decoded.user;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Please Login - Jwt Error', error: error.message });
    }
};
export default isAuth;
