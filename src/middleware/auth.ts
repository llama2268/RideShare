import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface CustomRequest extends Request {
  user: string | jwt.JwtPayload;
}

// Middleware to verify JWT token
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    (req as CustomRequest).user = decoded;

    next();
  } catch (err) {
    res.status(401).send('Unauthorized: Invalid token');
  }
};
