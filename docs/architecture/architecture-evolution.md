# Big Picture Architecture Evolution

## Goal

Show how the current local-first MVP evolves without breaking the extensible core contracts.

This doc aligns `LONG_TERM.md` with current implementation boundaries.

## Phase View

```mermaid
flowchart LR
  P0["Phase 0 and 1 Local MVP"] --> P2["Phase 2 Cloud MVP"]
  P2 --> P3["Phase 3 Personalization"]
  P3 --> P4["Phase 4 Content Scaling"]
  P4 --> P5["Phase 5 Optional AI"]

  subgraph P0["Phase 0 and 1 Local MVP"]
    A["SessionEngine"]
    B["SkillRegistry and generators"]
    C["TaskRenderer and UI"]
    D["ProgressStore interface"]
    E["ProgressStoreLocal localStorage"]
  end

  subgraph P2["Phase 2 Cloud MVP"]
    F["ProgressStoreLocal"]
    G["ProgressStoreRemote Supabase"]
    H["Dual write and sync queue"]
  end

  A --> D
  D --> E
  D --> F
  D --> G
  G --> H
```

## Reliable Core vs Replaceable Edges

```mermaid
flowchart TB
  subgraph Core["Core that should stay stable"]
    A["Task contract"]
    B["SessionEngine orchestration"]
    C["Skill and TaskType registries"]
    D["Generator constraints and anti-repeat"]
  end

  subgraph Edges["Replaceable edges"]
    E["Renderer implementations"]
    F["ProgressStore implementation"]
    G["Remote config and feature flags"]
    H["Analytics and event sinks"]
  end

  A --> E
  B --> F
  C --> G
  D --> H
```

## Recommended ProgressStore Abstraction

```mermaid
classDiagram
  class ProgressStore {
    <<interface>>
    +loadProfile()
    +saveSettings(settings)
    +appendAttempt(event)
    +appendSessionResult(result)
    +getSkillSummary()
  }

  class ProgressStoreLocal {
    +localStorage implementation
  }

  class ProgressStoreRemote {
    +Supabase implementation
    +offline queue
  }

  ProgressStore <|.. ProgressStoreLocal
  ProgressStore <|.. ProgressStoreRemote
```

## Migration Path (No Pain Transition)

```mermaid
sequenceDiagram
  participant App
  participant Local as ProgressStoreLocal
  participant Remote as ProgressStoreRemote

  App->>Local: load local progress
  App->>Remote: user login
  App->>Remote: upload local snapshot once
  App->>Local: mark migrated
  App->>Local: append session result
  App->>Remote: append session result dual write
  Remote-->>App: sync status ok
```

## Extending to New Math Domains (Bridge 10 to Bridge 20)

From `ENABLEMENT.md`, treat new content as configuration and generators, not engine rewrites:

1. Add skill metadata (`concept`, `base`, `operation`, optional `mode`).
2. Add or reuse generic task types (`fillToBase`, `bridgeSubtract`, etc).
3. Add representation variant (`tenFrame`, `doubleTenFrame`, `numberLine`) via renderer registry.
4. Keep the session and persistence contracts unchanged.

## Guardrails For Future Work

1. New skill PRs should only touch registry, generators, i18n text, and renderer mapping.
2. New storage backends should implement `ProgressStore` and avoid app-level branching.
3. New personalization logic should consume attempt/session events, not mutate task contracts.
4. AI or remote planning must emit valid task blueprints that pass deterministic generator validation.
