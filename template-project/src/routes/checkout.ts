import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { requireObjectBody } from '../middleware/validation.js';
import { submitCheckout } from '../services/checkout-service.js';

type CheckoutRequest = {
  items?: Array<{
    sku?: unknown;
    quantity?: unknown;
  }>;
  shippingAddress?: {
    line1?: unknown;
    city?: unknown;
    postalCode?: unknown;
    country?: unknown;
  };
  paymentToken?: unknown;
};

export const checkoutRouter = Router();

checkoutRouter.post('/checkout', requireObjectBody, asyncHandler(async (req, res) => {
  const result = await submitCheckout((req.body || {}) as CheckoutRequest);
  res.status(result.status).json(result.body);
}));
