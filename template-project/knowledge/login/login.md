# Login

## Intent
Allow an existing user to authenticate securely and access the application.

## Happy Path
- User provides a registered email and correct password.
- System authenticates the user.
- System returns a valid session token.

## Rules
- LGN-001: Login requires registered email.
- LGN-002: Login requires correct password for the registered email.
- LGN-003: Successful login returns an active session token.

## Edge Cases
- Unknown email: return invalid credentials error.
- Wrong password: return invalid credentials error.
- Locked account: block login and show account status message.

## Non-Goals
- Multi-factor authentication behavior.
