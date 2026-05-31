---
name: bda-api-test-design-patterns
description: Generate and maintain robust API tests using reusable request, auth, and assertion patterns.
---

# BDA API Test Design Patterns Skill

Use this skill when creating or refactoring API tests in `tests/api/`.

## Goals

- Keep API tests deterministic and contract-focused.
- Standardize auth handling and response assertions.
- Minimize flaky behavior and duplicated setup.

## Patterns

1. Auth fixture pattern:
   - Acquire auth token once per worker.
   - Provide helper for authorized requests.
2. Request builder pattern:
   - Build payloads with defaults and explicit overrides.
3. Response contract checks:
   - Validate status code, schema-critical fields, and error shape.
4. Negative path pattern:
   - Validate invalid auth, missing fields, and conflict cases.
5. Idempotency pattern:
   - Validate repeated requests where relevant.

## Test Case Naming

- File: `<feature>.api.spec.ts`
- Title: `[RULE-ID] API <expected behavior>`

## Done Criteria

- Each rule has positive or negative API coverage.
- No hard-coded secrets in tests.
- API tests run consistently in CI and local environments.
