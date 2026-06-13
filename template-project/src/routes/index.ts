import { Router } from 'express';
import { checkoutRouter } from './checkout.js';
import { featureStubRouter } from './feature-stubs.js';
import { healthRouter } from './health.js';
import { loginRouter } from './login.js';
import { registrationRouter } from './registration.js';
import { usersRouter } from './users.js';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(registrationRouter);
apiRouter.use(loginRouter);
apiRouter.use(usersRouter);
apiRouter.use(checkoutRouter);
apiRouter.use(featureStubRouter);
