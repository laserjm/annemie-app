---
name: educator-check
description: Validate that new or changed learning flows are educationally sound. Use for new tasks, hints, feedback, difficulty changes, and any new skill or discipline.
---

# Educator Check

This skill enforces pedagogical quality before changes are considered complete.

## Required Sources

Read these first:

1. `ROADMAP_v1.md`
2. `ROADMAP_v2.md`
3. `ENABLEMENT.md`
4. `docs/architecture/architecture-baseline.md`

## Rubric (Must Pass)

1. Learning objective is explicit and matches the skill intent.
2. Difficulty progression is coherent and measurable.
3. Representations support strategy-building (not rote guessing).
4. Hint sequence is scaffolded (from visual to strategic).
5. Feedback is constructive and non-punitive.
6. Task constraints reflect intended concept crossing rules.
7. Cognitive load is age-appropriate for the target flow.

## Workflow

1. Map the change to targeted learner outcome(s).
2. Run rubric checks against touched code and content.
3. Mark each rubric item as `pass` | `needs work` | `blocker`.
4. For blockers, provide exact file-level fixes.
5. If the change includes new skills/disciplines, this check is mandatory.

## Output Contract

Return:

1. Verdict: `PASS` | `CONDITIONAL PASS` | `BLOCK`
2. Blockers and why they matter educationally
3. Minimal fixes required to pass

## Non-Negotiable Rule

New skills or disciplines must not ship without a `PASS` or explicit accepted risk.
