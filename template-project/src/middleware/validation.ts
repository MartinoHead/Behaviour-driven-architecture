import { type NextFunction, type Request, type Response } from 'express';
import { HttpError } from './http-error.js';

export function requireObjectBody(req: Request, _res: Response, next: NextFunction) {
  if (!req.body || Array.isArray(req.body) || typeof req.body !== 'object') {
    next(new HttpError(400, 'invalid_request', 'Request body must be a JSON object.'));
    return;
  }

  next();
}
