import {
  EMAIL_PATTERN,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  verifyPassword,
} from '../data/in-memory-auth-store.js';
import { createJwtForUser } from '../auth/jwt.js';
import { createAuthUser, findAuthUserByEmail } from '../repositories/identity-repository.js';

type RegistrationResult =
  | { status: 201; body: { userId: string; email: string; verificationEmailQueued: true } }
  | { status: 400; body: { error: 'invalid_email' | 'invalid_password'; message: string } }
  | { status: 409; body: { error: 'duplicate_email'; message: string } };

type LoginResult =
  | { status: 200; body: { sessionToken: string; tokenType: 'Bearer'; active: true } }
  | { status: 401; body: { error: 'invalid_credentials'; message: string } }
  | { status: 423; body: { error: 'account_locked'; message: string } };

export async function registerUser(input: { email?: unknown; password?: unknown }): Promise<RegistrationResult> {
  const email = normalizeEmail(input.email);
  const password = String(input.password || '');

  if (!EMAIL_PATTERN.test(email)) {
    return {
      status: 400,
      body: {
        error: 'invalid_email',
        message: 'Email must be valid format.',
      },
    };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      status: 400,
      body: {
        error: 'invalid_password',
        message: `Password length must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      },
    };
  }

  const user = await createAuthUser(email, password);

  if (!user) {
    return {
      status: 409,
      body: {
        error: 'duplicate_email',
        message: 'Email already registered.',
      },
    };
  }

  return {
    status: 201,
    body: {
      userId: user.userId,
      email,
      verificationEmailQueued: true,
    },
  };
}

export async function loginUser(input: { email?: unknown; password?: unknown }): Promise<LoginResult> {
  const email = normalizeEmail(input.email);
  const password = String(input.password || '');
  const user = await findAuthUserByEmail(email);

  if (!user) {
    return {
      status: 401,
      body: {
        error: 'invalid_credentials',
        message: 'Invalid credentials.',
      },
    };
  }

  if (user.locked) {
    return {
      status: 423,
      body: {
        error: 'account_locked',
        message: 'Account is locked.',
      },
    };
  }

  if (!verifyPassword(user, password)) {
    return {
      status: 401,
      body: {
        error: 'invalid_credentials',
        message: 'Invalid credentials.',
      },
    };
  }

  return {
    status: 200,
    body: {
      sessionToken: createJwtForUser(user.userId),
      tokenType: 'Bearer',
      active: true,
    },
  };
}