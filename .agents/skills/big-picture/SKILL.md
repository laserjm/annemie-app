---
name: big-picture
description: Ensure implementation decisions align with the long-term architecture and roadmap phases. Use to validate that changes are directionally correct and avoid short-term choices that block future evolution.
---

# Big Picture

This skill checks whether a change is aligned with long-term architecture direction.

## Required Sources

Read these first:

1. `docs/architecture/architecture-evolution.md`
2. `docs/architecture/architecture-baseline.md`
3. `LONG_TERM.md`
4. `ROADMAP_v2.md`

## Workflow

1. Classify the change by phase impact (Phase 0/1/2/3/4/5).
2. Verify local-first and extensibility constraints are preserved.
3. Check whether abstractions are introduced at the right time:
- now: stable interfaces
- later: replaceable implementations
4. Flag premature coupling (for example backend assumptions inside core runtime).
5. Provide mitigations that keep momentum without violating direction.
6. If architecture boundaries changed, require `architecture-docs-updater`.

## Output Contract

Return:

1. Alignment verdict: `aligned` | `partially aligned` | `misaligned`
2. Main risks to long-term sustainability
3. Concrete adjustments to restore alignment

## Non-Negotiable Rule

No architectural change is accepted if it conflicts with documented evolution phases.
