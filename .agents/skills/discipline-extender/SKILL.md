---
name: discipline-extender
description: Add a new discipline (for example writing) while preserving core extensible architecture. Enforces architecture source-of-truth, big-picture alignment, and mandatory educator validation.
---

# Discipline Extender

Use this skill when introducing a new discipline, not just a new skill.

## Chain of Authority

1. Architecture docs are the source of truth.
2. Discipline additions always require architecture doc updates.
3. Discipline design must align with long-term roadmap phases.
4. Educator validation is mandatory before completion.

## Required Sources

Read these first:

1. `docs/architecture/architecture-baseline.md`
2. `docs/architecture/architecture-evolution.md`
3. `LONG_TERM.md`
4. `ROADMAP_v2.md`
5. `ENABLEMENT.md`

## Implementation Workflow

1. Define discipline model and namespace boundaries.
2. Extend registries without hardcoding discipline-specific branches in engine core.
3. Keep task contract backward-compatible; version if needed.
4. Add at least one vertical slice skill for the new discipline.
5. Confirm persistence compatibility and migration strategy if data shape changes.
6. Run `big-picture` alignment.
7. Run mandatory `educator-check`.
8. Update architecture docs and Mermaid diagrams via `architecture-docs-updater`.

## Guardrails

1. Avoid rewriting `SessionEngine` into discipline-specific logic.
2. Keep renderer and generator concerns separated.
3. Ensure existing disciplines continue to work unchanged.
4. Prefer additive interfaces over breaking changes.

## Done Criteria

1. New discipline integrated through extensible boundaries.
2. Existing disciplines unaffected.
3. Educator check passes.
4. Architecture docs updated and authoritative.

## Non-Negotiable Rule

A new discipline is incomplete if any of educator, big-picture, or architecture-doc gates fail.
