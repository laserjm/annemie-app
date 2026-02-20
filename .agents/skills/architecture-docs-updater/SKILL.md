---
name: architecture-docs-updater
description: Keep architecture docs as the source of truth. Use when notable changes affect architecture boundaries, contracts, or extension seams so docs and Mermaid diagrams are updated immediately.
---

# Architecture Docs Updater

This skill enforces that architecture docs are always authoritative and current.

## Required Sources

Read these first:

1. `docs/architecture/architecture-baseline.md`
2. `docs/architecture/architecture-evolution.md`
3. `docs/architecture/README.md`

## Trigger Conditions

Use this skill when changes touch any of:

- `lib/domain/*` task/session contracts
- `lib/session/*` orchestration and adaptation logic
- `lib/skills/*` registry and skill definition shape
- `lib/generators/*` generator pipeline and constraints
- `components/tasks/*` rendering boundaries
- `lib/persistence/*` storage boundaries or interfaces
- Any new discipline/skill framework

## Workflow

1. Inspect changed files and determine architecture impact.
2. If architecture impact exists, update the docs in `docs/architecture/`.
3. Keep Mermaid diagrams aligned with as-is implementation.
4. Explicitly document:
- stable contracts
- extension seams
- current gaps
- migration implications (if any)
5. If no architecture impact exists, state that no doc update is required.

## Output Contract

Provide:

1. What changed in architecture terms.
2. Which architecture docs were updated.
3. Why those updates preserve source-of-truth status.

## Non-Negotiable Rule

If architecture changed and docs were not updated, work is incomplete.
