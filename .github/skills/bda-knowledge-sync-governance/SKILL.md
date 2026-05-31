---
name: bda-knowledge-sync-governance
description: Enforce naming, rule IDs, and consistency standards for synchronized md/yaml/gherkin knowledge assets.
---

# BDA Knowledge Sync Governance Skill

Use this skill when validating repository-wide knowledge quality before generating tests.

## Goals

- Enforce a predictable feature-folder structure.
- Prevent duplicate or conflicting rules.
- Keep tri-format knowledge aligned and reviewable.

## Governance Rules

1. Feature path format:
   - `knowledge/<feature>/<feature>.md`
   - `knowledge/<feature>/<feature>.yaml`
   - `knowledge/<feature>/<feature>.feature`
2. Rule IDs must follow `AAA-999` format.
3. Rule IDs must be unique across the full knowledge tree.
4. Rule text must be equivalent across md/yaml/gherkin.
5. Each feature must define Intent, Rules, and Edge Cases in markdown.

## Validation Output

Report:

- Missing format files per feature.
- Rule ID format violations.
- Duplicate IDs with file locations.
- Rule meaning mismatches by format.

## Done Criteria

- All features pass sync and governance checks.
- No duplicate or malformed rule IDs.
- CI gates block merges when governance checks fail.
