---
name: sustainable-architecture-orchestrator
description: Single entry-point governance skill for sustainable development. Decides which follow-up skills are required (architecture-docs-updater, big-picture, educator-check, skills-extender, discipline-extender) and enforces completion gates.
---

# Sustainable Architecture Orchestrator

Use this as the default governance skill so one invocation can enforce the full quality chain.

## Authority Model

1. `docs/architecture/*` is the source of truth.
2. Architecture-impacting changes must update architecture docs.
3. Skill/discipline extensions must follow extensible architecture rules.
4. New skills/disciplines require educator validation.
5. Long-term direction must remain aligned with roadmap phases.

## Required Initial Read

1. `docs/architecture/architecture-baseline.md`
2. `docs/architecture/architecture-evolution.md`
3. `docs/architecture/README.md`
4. `LONG_TERM.md`
5. `ROADMAP_v2.md`
6. `ENABLEMENT.md`

## Routing Matrix

Evaluate the change, then route to required follow-up skills:

1. If architecture boundaries/contracts changed:
- run `architecture-docs-updater`
- run `big-picture`
2. If a new skill in an existing discipline is added:
- run `skills-extender`
- run `educator-check`
- run `big-picture` if architecture implications exist
3. If a new discipline is added:
- run `discipline-extender`
- run `educator-check` (mandatory)
- run `big-picture` (mandatory)
- run `architecture-docs-updater` (mandatory)
4. If pedagogical behavior changed (hints, difficulty, feedback, task design):
- run `educator-check`
5. If no architecture, roadmap, or pedagogy impact:
- report “no downstream skills required”

## Standard Workflow

1. Classify change type.
2. Select required downstream skills from the matrix.
3. Execute checks/fixes in dependency order:
- architecture docs
- big-picture alignment
- extender path
- educator gate
4. Confirm done criteria from each selected skill.
5. Return final governance status.

## Output Contract

Return:

1. Change classification
2. Skills invoked and why
3. Gate results (`pass` | `conditional` | `block`)
4. Remaining actions, if any

## Completion Rule

A change is complete only when all required downstream skill gates pass.
