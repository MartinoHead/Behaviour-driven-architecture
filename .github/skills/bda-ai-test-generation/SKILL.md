---
name: bda-ai-test-generation
description: Generate deterministic UI and API tests from synchronized behavior knowledge files and keep rule-to-test traceability.
---

# BDA AI Test Generation Skill

Use this skill when generating or updating automated tests from synchronized knowledge files in `knowledge/*.md`, `knowledge/*.yaml`, and `knowledge/*.feature`.

## Goals

- Convert behavior rules into executable tests.
- Keep tests deterministic and maintainable.
- Preserve a clear mapping from rules to test cases.

## Generation Steps

1. Read impacted `knowledge/*.md` files.
2. Extract rules and expected outcomes.
3. Generate UI tests in `tests/playwright/` grouped by feature.
4. Generate API tests in `tests/api/` grouped by feature.
5. Add traceability comments with rule IDs.
6. Run tests and report pass/fail per rule.

## Test Constraints

- No hard sleeps.
- Prefer resilient locators (`getByRole`, labels, test IDs).
- Each test validates one business assertion cluster.
- Setup and teardown must be isolated.
- Use fixtures for shared setup.

## Naming Convention

- UI File: `<feature>.spec.ts`
- API File: `<feature>.api.spec.ts`
- Test title: `[RULE-ID] <human-readable expectation>`

## Output Contract

For every generation run, produce:

- List of processed knowledge files.
- List of generated/updated tests.
- Rule coverage map (`rule_id -> test_name`).
- Gaps where a rule could not be tested.

## Done Criteria

- All generated tests compile and run.
- Rule coverage map has no unexplained gaps.
- Failing tests include actionable diagnostics.
