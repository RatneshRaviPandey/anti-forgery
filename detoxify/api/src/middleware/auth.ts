import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthRequest extends Request {
  userId?: string;
  userTier?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; tier: string };
    req.userId = decoded.userId;
    req.userTier = decoded.tier;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function tierGate(...allowedTiers: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userTier || !allowedTiers.includes(req.userTier)) {
      res.status(403).json({ message: 'This feature requires a higher subscription tier' });
      return;
    }
    next();
  };
}
