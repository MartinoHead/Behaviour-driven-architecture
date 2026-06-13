import { expect, test } from '@playwright/test';
import {
  API_HEALTH_PATH,
  API_PREFIX_HEADER,
  API_PREFIX_VALUE,
} from './support/api-prefix-header.js';

const validPayload = {
  items: [{ sku: 'sku-1', quantity: 1 }],
  shippingAddress: {
    line1: '123 Main St',
    city: 'Sofia',
    postalCode: '1000',
    country: 'BG',
  },
  paymentToken: 'pay_ok_123',
};

test('[CHK-001] API Checkout requires at least one cart item.', async ({ request }) => {
  const response = await request.post('/v1/checkout', {
    data: {
      ...validPayload,
      items: [],
    },
  });

  expect(response.status()).toBe(400);
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await response.json();
  expect(payload.error).toBe('empty_cart');
});

test('[CHK-002] API Shipping address fields are mandatory.', async ({ request }) => {
  const response = await request.post('/v1/checkout', {
    data: {
      ...validPayload,
      shippingAddress: {
        line1: '',
        city: '',
        postalCode: '',
        country: '',
      },
    },
  });

  expect(response.status()).toBe(400);
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await response.json();
  expect(payload.error).toBe('invalid_shipping_address');
});

test('[CHK-003] API Payment authorization is required before order creation.', async ({ request }) => {
  const response = await request.post('/v1/checkout', {
    data: {
      ...validPayload,
      paymentToken: 'declined_token',
    },
  });

  expect(response.status()).toBe(402);
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await response.json();
  expect(payload.error).toBe('payment_not_authorized');
});

test('[CHK-004] API Confirmation page includes order reference.', async ({ request }) => {
  const response = await request.post('/v1/checkout', {
    data: validPayload,
  });

  expect(response.status()).toBe(201);
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await response.json();
  expect(payload.paymentAuthorized).toBe(true);
  expect(payload.orderReference).toMatch(/^ord_\d+$/);
});

test('[CHK-000] API responses include prefix header.', async ({ request }) => {
  const response = await request.get(API_HEALTH_PATH);

  expect(response.ok()).toBeTruthy();
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);
});
