import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Невалидный или просроченный токен' });
  }

  req.user = { id: payload.userId };
  next();
}
