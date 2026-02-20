import type { PersistedProgress, SessionResult } from "@/lib/domain/session"
import type { Skill } from "@/lib/domain/task"

export type ProgressStore = {
  loadProgress: () => PersistedProgress
  saveProgress: (progress: PersistedProgress) => void
  appendSessionResult: (result: SessionResult) => PersistedProgress
  updateLastFocusSkill: (skill: Skill | null) => PersistedProgress
}
