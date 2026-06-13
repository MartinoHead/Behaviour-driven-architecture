import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { requireObjectBody } from '../middleware/validation.js';
import { loginUser } from '../services/auth-service.js';

type LoginRequest = {
  email?: unknown;
  password?: unknown;
};

export const loginRouter = Router();

loginRouter.post('/login', requireObjectBody, asyncHandler(async (req, res) => {
  const result = await loginUser((req.body || {}) as LoginRequest);
  res.status(result.status).json(result.body);
}));
