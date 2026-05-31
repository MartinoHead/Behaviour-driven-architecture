---
name: bda-change-impact-analysis
description: Identify impacted knowledge features from code and behavior changes and run selective test generation/execution.
---

# BDA Change Impact Analysis Skill

Use this skill in pull requests to reduce unnecessary regeneration and execution.

## Goals

- Map changed files to impacted features quickly.
- Regenerate only relevant UI/API tests.
- Keep full traceability from change to executed rules.

## Inputs

- Git diff for PR.
- Knowledge files changed.
- Source and API module paths changed.

## Mapping Heuristics

1. Direct mapping:
   - Changes in `knowledge/<feature>/` impact that feature.
2. API mapping:
   - Changes in endpoint handlers map to related feature folder.
3. Shared module mapping:
   - Changes in shared auth/validation map to all affected features.

## Output Contract

Produce:

- Impacted features list.
- Regenerated UI specs list.
- Regenerated API specs list.
- Executed tests list.
- Uncertain mappings requiring manual confirmation.

## Done Criteria

- PR pipeline runs selective tests by default.
- Optional nightly full run still validates global health.
