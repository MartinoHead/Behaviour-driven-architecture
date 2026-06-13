import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { requireObjectBody } from '../middleware/validation.js';
import { registerUser } from '../services/auth-service.js';

type RegistrationRequest = {
  email?: unknown;
  password?: unknown;
};

export const registrationRouter = Router();

registrationRouter.post('/registration', requireObjectBody, asyncHandler(async (req, res) => {
  const result = await registerUser((req.body || {}) as RegistrationRequest);
  res.status(result.status).json(result.body);
}));
