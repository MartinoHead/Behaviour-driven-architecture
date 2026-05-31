# Create User

## Intent
Allow an authorized actor to create a new user account through API or admin workflow.

## Happy Path
- Authorized request includes required user payload.
- System creates a new user record.
- System returns created user identifier.

## Rules
- USR-001: Create user requires authorization.
- USR-002: Create user requires unique email.
- USR-003: Successful create user returns created user identifier.

## Edge Cases
- Missing authorization: return unauthorized response.
- Duplicate email: reject create request with conflict response.
- Missing required fields: return validation errors.

## Non-Goals
- User profile preference management.
