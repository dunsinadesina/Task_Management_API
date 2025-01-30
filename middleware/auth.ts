import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request{
    user?: any;
}

const auth = (req: AuthRequest, res: Response, next: NextFunction)=>{
    const token = req.header('x-auth-token');

    if (!token){
        return res.status(400).json({message: 'No token, authorization denied'})
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string)
        req.user = (decodedToken as any).user
        next();
    } catch (error) {
        res.status(400).json({message: 'Token is not valid'})
    }
}

export const authenticateUser = (req: Request, res: Response, next: NextFunction)=>{
    const token = req.cookies.token //get token from HTTP cookies

    if (!token){
        console.error('Unauthorized: No token provided')
        return res.status(401).json({message: 'Unauthorized: No token provided'})
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).user = decoded //attach user to request object
        next();
    } catch (error) {
        console.error('Invalid or expired token')
        return res.status(500).json({message: 'Invalid or expired token'})
    }
}

export default auth;