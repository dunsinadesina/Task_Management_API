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
    console.log('User authenticated:', req.isAuthenticated());
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed to the next handler
    }
    return res.status(401).json({ message: 'Unauthorized' }); // User not authenticated
}

export default auth;