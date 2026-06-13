import { expect, test } from '@playwright/test';
import {
  API_HEALTH_PATH,
  API_PREFIX_HEADER,
  API_PREFIX_VALUE,
} from './support/api-prefix-header.js';

function uniqueEmail(label: string) {
  return `${label}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

test('[REG-001] API Email must be valid format.', async ({ request }) => {
  const response = await request.post('/v1/registration', {
    data: {
      email: 'invalid-email',
      password: 'strongpass',
    },
  });

  expect(response.status()).toBe(400);
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await response.json();
  expect(payload.error).toBe('invalid_email');
});

test('[REG-002] API Email must be unique.', async ({ request }) => {
  const email = uniqueEmail('reg-duplicate');
  const validPayload = {
    email,
    password: 'strongpass',
  };

  const firstResponse = await request.post('/v1/registration', {
    data: validPayload,
  });
  expect(firstResponse.status()).toBe(201);

  const duplicateResponse = await request.post('/v1/registration', {
    data: validPayload,
  });

  expect(duplicateResponse.status()).toBe(409);
  expect(duplicateResponse.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await duplicateResponse.json();
  expect(payload.error).toBe('duplicate_email');
});

test('[REG-003] API Password length must be at least 10 characters.', async ({ request }) => {
  const response = await request.post('/v1/registration', {
    data: {
      email: uniqueEmail('reg-weak-password'),
      password: 'short',
    },
  });

  expect(response.status()).toBe(400);
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await response.json();
  expect(payload.error).toBe('invalid_password');
});

test('[REG-004] API Verification email is sent after successful registration.', async ({ request }) => {
  const response = await request.post('/v1/registration', {
    data: {
      email: uniqueEmail('reg-success'),
      password: 'strongpass',
    },
  });

  expect(response.status()).toBe(201);
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await response.json();
  expect(payload.verificationEmailQueued).toBe(true);
  expect(payload.userId).toMatch(/^usr_\d+$/);
});

test('[REG-000] API responses include prefix header.', async ({ request }) => {
  const response = await request.get(API_HEALTH_PATH);

  expect(response.ok()).toBeTruthy();
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);
});
