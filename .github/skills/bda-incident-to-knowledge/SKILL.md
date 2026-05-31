---
name: bda-incident-to-knowledge
description: Convert incidents into knowledge updates and regression tests with clear traceability.
---

# BDA Incident To Knowledge Skill

Use this skill after escaped defects, production incidents, or postmortems.

## Goals

- Transform incidents into durable knowledge updates.
- Add explicit regression protection for recurrence prevention.
- Preserve audit trail from incident to rule to test.

## Workflow

1. Capture incident facts:
   - Trigger conditions
   - Affected endpoints or UI flows
   - Expected vs actual behavior
2. Classify root cause:
   - Missing rule
   - Incomplete rule
   - Existing rule not covered by tests
   - Environment/config issue
3. Update knowledge files (md/yaml/gherkin).
4. Generate UI/API regression test stubs with rule IDs.
5. Verify the new tests fail before fix and pass after fix.

## Traceability Tags

- Incident ID in knowledge change note.
- Rule IDs in test titles.
- Link postmortem reference in PR description.

## Done Criteria

- Incident path represented in synchronized knowledge files.
- Regression tests added and passing in CI.
- Root cause and prevention notes documented.
