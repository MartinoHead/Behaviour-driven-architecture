import { randomUUID } from 'node:crypto';
import { type NextFunction, type Request, type Response } from 'express';

const REQUEST_ID_HEADER_NAME = 'x-request-id';

export function requestIdMiddleware(_req: Request, res: Response, next: NextFunction) {
  res.setHeader(REQUEST_ID_HEADER_NAME, randomUUID());
  next();
}
