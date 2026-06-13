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
  const email = uniqueEmail('usg-auth');
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

test('[USG-001] API Get user requires authorization.', async ({ request }) => {
  const response = await request.get('/v1/users/usr_999999');

  expect(response.status()).toBe(401);
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await response.json();
  expect(payload.error).toBe('unauthorized');
});

test('[USG-002] API Get user requires existing user identifier.', async ({ request }) => {
  const token = await authToken(request);

  const response = await request.get('/v1/users/usr_999999', {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  expect(response.status()).toBe(404);
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await response.json();
  expect(payload.error).toBe('not_found');
});

test('[USG-003] API Successful get user returns user details payload.', async ({ request }) => {
  const token = await authToken(request);

  const createUserResponse = await request.post('/v1/users', {
    headers: {
      authorization: `Bearer ${token}`,
    },
    data: {
      email: uniqueEmail('usg-success'),
      firstName: 'John',
      lastName: 'Smith',
    },
  });
  expect(createUserResponse.status()).toBe(201);
  const createPayload = await createUserResponse.json();

  const response = await request.get(`/v1/users/${createPayload.userId}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  expect(response.status()).toBe(200);
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);

  const payload = await response.json();
  expect(payload.userId).toBe(createPayload.userId);
  expect(payload.email).toContain('@example.com');
  expect(payload.firstName).toBe('John');
  expect(payload.lastName).toBe('Smith');
});

test('[USG-000] API responses include prefix header.', async ({ request }) => {
  const response = await request.get(API_HEALTH_PATH);

  expect(response.ok()).toBeTruthy();
  expect(response.headers()[API_PREFIX_HEADER]).toBe(API_PREFIX_VALUE);
});
