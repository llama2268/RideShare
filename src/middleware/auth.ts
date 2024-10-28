import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { getErrorMessage } from '../utils/errors.util';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface CustomRequest extends Request {
  user: string | jwt.JwtPayload;
}

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
