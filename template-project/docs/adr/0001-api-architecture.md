# ADR 0001: API Architecture Baseline

- Status: Accepted
- Date: 2026-06-12
- Scope: template-project real API implementation baseline

## Context

The project started from a Product Knowledge as Code template and needed a stable architecture direction before adding persistence, security hardening, and CI quality gates.

## Decision

1. Runtime
- Node.js + TypeScript + Express
- Current API versioning prefix: /v1

2. API Contract and Documentation
- OpenAPI 3.0.3 as the single API contract output
- Swagger UI served from /docs
- OpenAPI JSON served from /openapi.json

3. Response Shape and Headers
- All responses include x-api-prefix header
- Use deterministic error codes in payloads for rule-driven assertions

4. Validation and Error Handling Direction
- Keep deterministic per-endpoint validation for current phase
- Introduce a centralized validation/error middleware layer in Task 1.3

5. Data and Auth Strategy (Incremental)
- Current phase: in-memory state for fast rule implementation and deterministic tests
- Next phase: PostgreSQL + Prisma as source of truth (Task 1.1)
- Next phase auth foundation: JWT-based access token middleware (Task 1.2)

6. Testing Strategy
- Playwright API tests as executable rule coverage from knowledge assets
- Rule IDs remain in test names for traceability and future coverage gating

7. Deployment Direction
- Container-based local/dev and CI runtime target (Task 5.2)

## Consequences

Positive:
- Clear and consistent implementation path across endpoints
- Stable API contract and deterministic test behavior
- Reduced ambiguity for upcoming DB/auth/security tasks

Trade-offs:
- In-memory storage is non-persistent and not production-ready
- Auth/session behavior is simplified until JWT middleware is added

## Follow-up Work

1. Implement PostgreSQL schema + Prisma migrations + seed flow
2. Add JWT verification middleware and protected route policy
3. Introduce centralized validation and error envelope middleware
4. Enforce traceability and sync gates in CI
