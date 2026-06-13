import { expect, test } from '@playwright/test';
import {
  API_HEALTH_PATH,
  API_PREFIX_HEADER,
  API_PREFIX_VALUE,
} from './support/api-prefix-header.js';

function uniqueEmail(label: string) {
  return `${label}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function authToken(request: Parameters<typeof test>[1] extends never ? never : any) {
  const email = uniqueEmail('usr-auth');
  const password = 'strongpass';

  const registrationResponse = await request.post('/v1/registration', {
    data: { email, password },
  });
  expect(registrationResponse.status()).toBe(201);

  const loginResponse = await request.post('/v1/login', {
    data: { email, password },
  });
  expect(loginResponse.status()).toBe(200);

  const payload = await loginResponse.json();
  return payload.sessionToken as string;
}

test('[USR-001] API Create user requires authorization.', async ({ request }) => {
  const response = await request.post('/v1/users', {
    data: {
      email: uniqueEmail('usr-no-auth'),
      firstName: 'No',
      lastName: 'Auth',
    },
  });

  expect(response.status()).toBe(401);
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await response.json();
  expect(payload.error).toBe('unauthorized');
});

test('[USR-002] API Create user requires unique email.', async ({ request }) => {
  const token = await authToken(request);
  const email = uniqueEmail('usr-duplicate');

  const firstResponse = await request.post('/v1/users', {
    headers: {
      authorization: `Bearer ${token}`,
    },
    data: {
      email,
      firstName: 'First',
      lastName: 'User',
    },
  });
  expect(firstResponse.status()).toBe(201);

  const duplicateResponse = await request.post('/v1/users', {
    headers: {
      authorization: `Bearer ${token}`,
    },
    data: {
      email,
      firstName: 'Second',
      lastName: 'User',
    },
  });

  expect(duplicateResponse.status()).toBe(409);
  expect(duplicateResponse.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await duplicateResponse.json();
  expect(payload.error).toBe('duplicate_email');
});

test('[USR-003] API Successful create user returns created user identifier.', async ({ request }) => {
  const token = await authToken(request);

  const response = await request.post('/v1/users', {
    headers: {
      authorization: `Bearer ${token}`,
    },
    data: {
      email: uniqueEmail('usr-success'),
      firstName: 'Jane',
      lastName: 'Doe',
    },
  });

  expect(response.status()).toBe(201);
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await response.json();
  expect(payload.userId).toMatch(/^usr_\d+$/);
});

test('[USR-000] API responses include prefix header.', async ({ request }) => {
  const response = await request.get(API_HEALTH_PATH);

  expect(response.ok()).toBeTruthy();
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);
});
