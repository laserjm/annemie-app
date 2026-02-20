---
name: skills-extender
description: Add or extend skills within an existing discipline (for example math) following the extensible architecture rules. Enforces architecture-docs, big-picture alignment, and educator-check gating.
---

# Skills Extender

Use this skill when adding a new skill in an existing discipline.

## Chain of Authority

1. Architecture docs are source of truth.
2. If architecture is touched, run `architecture-docs-updater`.
3. Validate long-term direction with `big-picture`.
4. Run mandatory `educator-check`.

## Required Sources

Read these first:

1. `docs/architecture/architecture-baseline.md`
2. `docs/architecture/architecture-evolution.md`
3. `ENABLEMENT.md`
4. `ROADMAP_v2.md`

## Implementation Workflow

1. Define skill spec:
- skill id and label key
- concept/base/operation/mode (when relevant)
- difficulty levels and thresholds
2. Reuse generic task types where possible.
3. Add generator constraints and anti-repeat compatibility.
4. Register skill in `lib/skills/registry.ts`.
5. Add/update task renderers only when truly needed.
6. Add i18n keys/messages.
7. Preserve `SessionEngine` agnosticism.
8. Run `educator-check`.
9. If architecture boundaries changed, update docs via `architecture-docs-updater`.

## Done Criteria

1. New skill works end-to-end.
2. Core contracts remain intact.
3. Educational checks pass.
4. Architecture docs remain current.

## Non-Negotiable Rule

No skill extension is complete unless educator and architecture gates pass.
