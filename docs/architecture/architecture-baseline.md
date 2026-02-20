# Extensible Architecture Baseline

## Goal

Define the "always reliable" architecture contracts for MVP 1:

- Adding a skill should not require changing `SessionEngine`.
- Adding a task renderer should not require changing generator logic.
- Difficulty and anti-repeat behavior should stay centralized.
- Persistence should remain behind one replaceable boundary.

This is based on current code plus the constraints in `ENABLEMENT.md`, `ROADMAP_v1.md`, and `ROADMAP_v2.md`.

## As-Built Runtime Flow (Current)

```mermaid
flowchart LR
  A["app/page.tsx"] --> B["AnnemieMvpApp"]
  B --> C["LocaleProvider and useReducer state"]
  C --> D["SessionEngine (lib/session/engine.ts)"]
  D --> E["buildSkillSequence and generateTaskForSkill"]
  E --> F["SkillRegistry (lib/skills/registry.ts)"]
  F --> G["Skill generator (lib/generators/*)"]
  G --> H["Task object (lib/domain/task.ts)"]
  H --> I["TaskRenderer switch (components/tasks/TaskRenderer.tsx)"]
  I --> J["Task UI component"]
  D --> K["SessionResult (lib/domain/session.ts)"]
  K --> L["appendSessionResult (lib/persistence/local.ts)"]
  L --> M["localStorage"]
```

## Stable Contracts To Keep

```mermaid
classDiagram
  class Task {
    +id
    +type
    +skill
    +difficulty
    +prompt
    +stimulus
    +interaction
    +answer
    +hints
    +scoring
  }

  class SkillDefinition {
    +id
    +labelKey
    +difficultyLevels
    +getDifficultyConfig(level)
    +generateTask(input)
  }

  class SessionEngine {
    +start(config)
    +getCurrentTask()
    +submitAnswer(input)
    +useHint()
    +finish()
  }

  class TaskRenderer {
    +render(task.type)
  }

  SessionEngine --> SkillDefinition : uses
  SkillDefinition --> Task : emits
  TaskRenderer --> Task : consumes
```

## Current Extension Seams

1. Skill extension seam: `lib/skills/registry.ts`
2. Generator seam: `lib/generators/*` and `generateTaskForSkill`
3. Renderer seam: `components/tasks/TaskRenderer.tsx`
4. Persistence seam: `lib/persistence/local.ts`

## Desired Hardening (From Enablement and Roadmap)

```mermaid
flowchart TB
  A["Skill metadata"] --> B["SkillRegistry entry"]
  B --> C["Difficulty config: range, base, crossingRule"]
  C --> D["Generator constraints and weighted choices"]
  D --> E["Generic TaskType payload"]
  E --> F["TaskTypeRendererRegistry"]
  F --> G["FrameRenderer variant tenFrame or doubleTenFrame or numberLine"]
```

## Architecture Invariants

1. `SessionEngine` must stay task-type agnostic.
2. Skill-specific rules stay in skill definitions and generators.
3. Renderers consume typed task payloads and avoid business-rule branching.
4. Anti-repeat and adaptive difficulty stay centralized in engine/generator utilities.
5. All persisted progress writes flow through one storage module interface.

## Gap Notes (Current vs Target)

1. `TaskRenderer` is currently switch-based, not registry-based.
2. Skill definitions currently map one skill to one generator; roadmap expects per-skill task-type mix.
3. Difficulty config currently focuses on speed thresholds; enablement expects richer config (`base`, `range`, `crossingRule`).
4. Persistence is local-only and function-based; long-term plan expects a `ProgressStore` interface.
