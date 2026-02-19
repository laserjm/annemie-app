import {
  createDefaultSkillSnapshot,
  createEmptyProgress,
  type PersistedProgress,
  type SessionResult,
} from "@/lib/domain/session"
import type { Skill } from "@/lib/domain/task"

const STORAGE_KEY = "annemie-progress-v1"

const isBrowser = (): boolean => typeof window !== "undefined"

const normalizeProgress = (value: unknown): PersistedProgress => {
  const fallback = createEmptyProgress()

  if (!value || typeof value !== "object") {
    return fallback
  }

  const candidate = value as Partial<PersistedProgress>

  if (candidate.version !== 1) {
    return fallback
  }

  return {
    version: 1,
    lastFocusSkill: candidate.lastFocusSkill ?? null,
    sessionHistory: Array.isArray(candidate.sessionHistory)
      ? candidate.sessionHistory.slice(0, 20)
      : [],
    skillSnapshot: {
      ...createDefaultSkillSnapshot(),
      ...(candidate.skillSnapshot ?? {}),
    },
  }
}

export const loadProgress = (): PersistedProgress => {
  if (!isBrowser()) {
    return createEmptyProgress()
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY)

    if (!rawValue) {
      return createEmptyProgress()
    }

    return normalizeProgress(JSON.parse(rawValue))
  } catch {
    return createEmptyProgress()
  }
}

export const saveProgress = (progress: PersistedProgress): void => {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

const mergeSessionIntoSnapshot = (
  progress: PersistedProgress,
  result: SessionResult
): PersistedProgress["skillSnapshot"] => {
  const snapshot = {
    ...progress.skillSnapshot,
  }

  const skills: Skill[] = ["quantity", "makeTen", "bridgeSubtract"]

  for (const skill of skills) {
    const skillResult = result.bySkill[skill]

    if (!skillResult || skillResult.total === 0) {
      snapshot[skill].difficulty = result.nextDifficultyBySkill[skill]
      continue
    }

    const previousAttempts = snapshot[skill].attempts
    const nextAttempts = previousAttempts + skillResult.total
    const weightedResponseMs =
      snapshot[skill].avgResponseMs * previousAttempts +
      result.avgResponseMs * skillResult.total

    snapshot[skill] = {
      attempts: nextAttempts,
      correct: snapshot[skill].correct + skillResult.correct,
      hintUses:
        snapshot[skill].hintUses +
        Math.round((result.hintUses * skillResult.total) / result.totalTasks),
      avgResponseMs: nextAttempts > 0 ? Math.round(weightedResponseMs / nextAttempts) : 0,
      difficulty: result.nextDifficultyBySkill[skill],
    }
  }

  return snapshot
}

export const appendSessionResult = (result: SessionResult): PersistedProgress => {
  const progress = loadProgress()

  const nextProgress: PersistedProgress = {
    ...progress,
    sessionHistory: [result, ...progress.sessionHistory].slice(0, 20),
    skillSnapshot: mergeSessionIntoSnapshot(progress, result),
  }

  saveProgress(nextProgress)
  return nextProgress
}

export const updateLastFocusSkill = (skill: Skill | null): PersistedProgress => {
  const progress = loadProgress()

  const nextProgress: PersistedProgress = {
    ...progress,
    lastFocusSkill: skill,
  }

  saveProgress(nextProgress)
  return nextProgress
}
