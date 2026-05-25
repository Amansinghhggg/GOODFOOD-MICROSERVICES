import {Request, Response, NextFunction} from 'express';
import jwt,{ JwtPayload } from 'jsonwebtoken';
import {IUser} from '../model/User.js';

const isAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & { user?: IUser };
        if(!decoded.user){
            res.status(401).json({ message: 'Please Login - Invalid Token' });
            return;
        }
        req.user = decoded.user;
        next();
    } catch (error: any) {
        res.status(401).json({ message: 'Please Login - Jwt Error', error: error.message });
    }
};


export default isAuth;