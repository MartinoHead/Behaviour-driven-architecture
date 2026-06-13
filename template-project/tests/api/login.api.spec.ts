import { expect, test } from '@playwright/test';
import {
  API_HEALTH_PATH,
  API_PREFIX_HEADER,
  API_PREFIX_VALUE,
} from './support/api-prefix-header.js';

function uniqueEmail(label: string) {
  return `${label}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

test('[LGN-001] API Login requires registered email.', async ({ request }) => {
  const response = await request.post('/v1/login', {
    data: {
      email: uniqueEmail('lgn-unknown'),
      password: 'strongpass',
    },
  });

  expect(response.status()).toBe(401);
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await response.json();
  expect(payload.error).toBe('invalid_credentials');
});

test('[LGN-002] API Login requires correct password for the registered email.', async ({ request }) => {
  const email = uniqueEmail('lgn-wrong-password');
  const password = 'strongpass';

  const registrationResponse = await request.post('/v1/registration', {
    data: { email, password },
  });
  expect(registrationResponse.status()).toBe(201);

  const response = await request.post('/v1/login', {
    data: {
      email,
      password: 'wrongpass',
    },
  });

  expect(response.status()).toBe(401);
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await response.json();
  expect(payload.error).toBe('invalid_credentials');
});

test('[LGN-003] API Successful login returns an active session token.', async ({ request }) => {
  const email = uniqueEmail('lgn-success');
  const password = 'strongpass';

  const registrationResponse = await request.post('/v1/registration', {
    data: { email, password },
  });
  expect(registrationResponse.status()).toBe(201);

  const response = await request.post('/v1/login', {
    data: {
      email,
      password,
    },
  });

  expect(response.status()).toBe(200);
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await response.json();
  expect(payload.active).toBe(true);
  expect(payload.tokenType).toBe('Bearer');
  expect(payload.sessionToken).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
});

test('[LGN-000] API responses include prefix header.', async ({ request }) => {
  const response = await request.get(API_HEALTH_PATH);

  expect(response.ok()).toBeTruthy();
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);
});
