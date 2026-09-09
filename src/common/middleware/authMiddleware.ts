import { Request, Response, NextFunction } from 'express';
import AuthService from '../../modules/auth/auth.service';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No authorization token');
    }

    const token = authHeader.substring(7);
    const user = await AuthService.verifyToken(token);

    (req as any).user = user;
    next();
  } catch (err: any) {
    return next(err);
  }
};