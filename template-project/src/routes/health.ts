import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'template-project-api',
    timestamp: new Date().toISOString(),
  });
});
