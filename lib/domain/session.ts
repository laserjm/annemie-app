import type { Difficulty, Skill, SkillDifficultyMap, SkillStats } from "@/lib/domain/task"

export type SessionResult = {
  sessionId: string
  startedAt: string
  finishedAt: string
  totalTasks: number
  correct: number
  hintUses: number
  avgResponseMs: number
  bySkill: SkillStats
  nextDifficultyBySkill: SkillDifficultyMap
}

export type AttemptRecord = {
  taskId: string
  skill: Skill
  isCorrect: boolean
  value: number | string
  responseMs: number
  hintLevelUsed: 0 | 1 | 2
}

export type SkillSnapshot = {
  attempts: number
  correct: number
  hintUses: number
  avgResponseMs: number
  difficulty: Difficulty
}

export type PersistedProgress = {
  version: 1
  lastFocusSkill: Skill | null
  sessionHistory: SessionResult[]
  skillSnapshot: Record<Skill, SkillSnapshot>
}

export const createEmptySkillStats = (): SkillStats => ({
  quantity: { correct: 0, total: 0 },
  makeTen: { correct: 0, total: 0 },
  bridgeSubtract: { correct: 0, total: 0 },
})

export const createDefaultSkillSnapshot = (): Record<Skill, SkillSnapshot> => ({
  quantity: {
    attempts: 0,
    correct: 0,
    hintUses: 0,
    avgResponseMs: 0,
    difficulty: 2,
  },
  makeTen: {
    attempts: 0,
    correct: 0,
    hintUses: 0,
    avgResponseMs: 0,
    difficulty: 2,
  },
  bridgeSubtract: {
    attempts: 0,
    correct: 0,
    hintUses: 0,
    avgResponseMs: 0,
    difficulty: 2,
  },
})

export const createEmptyProgress = (): PersistedProgress => ({
  version: 1,
  lastFocusSkill: null,
  sessionHistory: [],
  skillSnapshot: createDefaultSkillSnapshot(),
})
