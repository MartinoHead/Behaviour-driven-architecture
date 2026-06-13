import { type NextFunction, type Request, type Response } from 'express';
import { extractBearerToken } from '../data/in-memory-auth-store.js';
import { verifyJwtAndGetUserId } from '../auth/jwt.js';

function unauthorizedResponse(res: Response) {
  res.status(401).json({
    error: 'unauthorized',
    message: 'Authorization required.',
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    unauthorizedResponse(res);
    return;
  }

  const userId = verifyJwtAndGetUserId(token);

  if (!userId) {
    unauthorizedResponse(res);
    return;
  }

  next();
}
