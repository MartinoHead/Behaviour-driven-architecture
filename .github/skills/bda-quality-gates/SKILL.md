---
name: bda-quality-gates
description: Define and enforce measurable CI gates for sync health, coverage, flakiness, and execution quality.
---

# BDA Quality Gates Skill

Use this skill when defining CI/CD enforcement criteria for this architecture.

## Goals

- Make quality decisions objective and repeatable.
- Prevent low-quality changes from merging.
- Provide actionable failure diagnostics.

## Gate Categories

1. Knowledge integrity gates:
   - Tri-format sync passes.
   - Rule ID format and uniqueness pass.
2. Coverage gates:
   - 100% rule-to-test mapping for changed features.
   - No uncovered new rule IDs.
3. Execution gates:
   - API test suite pass.
   - UI test suite pass.
4. Reliability gates:
   - Flake rate below defined threshold.
   - Retry budget not exceeded.

## Failure Reporting

Every failed gate should report:

- Gate name
- Failing rules/features
- Suggested next action
- Owning team or area tag

## Done Criteria

- Gates are codified in CI workflow.
- Merge policy enforces gate success.
- Trend metrics are tracked per sprint.
