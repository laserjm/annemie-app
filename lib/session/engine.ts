import {
  clampDifficulty,
  type Skill,
  type SkillDifficultyMap,
  type Task,
} from "@/lib/domain/task"
import { DEFAULT_LOCALE } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/types"
import {
  createEmptySkillStats,
  type AttemptRecord,
  type SessionResult,
} from "@/lib/domain/session"
import {
  buildSessionSeed,
  buildSkillSequence,
  generateTaskForSkill,
  type SessionMode,
} from "@/lib/generators"
import { createSeededRng, type Rng } from "@/lib/generators/rng"
import { getSkillDefinition } from "@/lib/skills/registry"

type StreakState = {
  fastCorrect: number
  wrong: number
}

const createDefaultDifficultyMap = (): SkillDifficultyMap => ({
  quantity: 2,
  makeTen: 2,
  bridgeSubtract: 2,
})

const createDefaultStreakState = (): Record<Skill, StreakState> => ({
  quantity: { fastCorrect: 0, wrong: 0 },
  makeTen: { fastCorrect: 0, wrong: 0 },
  bridgeSubtract: { fastCorrect: 0, wrong: 0 },
})

const normalizeAnswer = (value: number | string): string =>
  typeof value === "number" ? String(value) : value.trim()

const matchesAnswer = (task: Task, value: number | string): boolean => {
  const normalizedInput = normalizeAnswer(value)
  const options = [task.answer.correct, ...(task.answer.alternatives ?? [])]
  return options.some((candidate) => normalizeAnswer(candidate) === normalizedInput)
}

const updateDifficulty = (input: {
  skill: Skill
  isCorrect: boolean
  responseMs: number
  hintLevelUsed: 0 | 1 | 2
  difficultyBySkill: SkillDifficultyMap
  streakBySkill: Record<Skill, StreakState>
}): void => {
  const streak = input.streakBySkill[input.skill]
  const currentDifficulty = input.difficultyBySkill[input.skill]
  const difficultyConfig =
    getSkillDefinition(input.skill).getDifficultyConfig(currentDifficulty)
  const wasFastEnough = input.responseMs <= difficultyConfig.speedThresholdMs
  const canIncrease = input.isCorrect && wasFastEnough && input.hintLevelUsed === 0

  if (input.isCorrect) {
    streak.wrong = 0
    streak.fastCorrect = canIncrease ? streak.fastCorrect + 1 : 0
  } else {
    streak.fastCorrect = 0
    streak.wrong += 1
  }

  if (streak.fastCorrect >= 3) {
    input.difficultyBySkill[input.skill] = clampDifficulty(currentDifficulty + 1)
    streak.fastCorrect = 0
    streak.wrong = 0
    return
  }

  if (streak.wrong >= 2) {
    input.difficultyBySkill[input.skill] = clampDifficulty(currentDifficulty - 1)
    streak.fastCorrect = 0
    streak.wrong = 0
  }
}

export type SessionEngine = {
  start(config: {
    mode?: SessionMode
    length: number
    seed?: string
    locale: Locale
  }): void
  getCurrentTask(): Task
  submitAnswer(input: { value: number | string; responseMs: number }): {
    isCorrect: boolean
    nextTaskReady: boolean
  }
  useHint(): { hintLevel: 1 | 2; message: string }
  finish(): SessionResult
  getProgress(): { current: number; completed: number; total: number }
  getCurrentHintLevel(): 0 | 1 | 2
}

export const createSessionEngine = (options?: {
  initialDifficultyBySkill?: Partial<SkillDifficultyMap>
}): SessionEngine => {
  const difficultyBySkill: SkillDifficultyMap = {
    ...createDefaultDifficultyMap(),
    ...options?.initialDifficultyBySkill,
  }

  const streakBySkill = createDefaultStreakState()

  let rng: Rng = Math.random
  let sessionId = ""
  let startedAt = ""
  let finishedAt = ""
  let length = 5
  let skillSequence: Skill[] = []
  let sessionLocale: Locale = DEFAULT_LOCALE
  let currentIndex = 0
  let currentTask: Task | null = null
  let currentHintLevel: 0 | 1 | 2 = 0
  let attempts: AttemptRecord[] = []
  let finished = false

  const ensureCurrentTask = (): Task => {
    if (!currentTask) {
      throw new Error("No active task. Start a session first.")
    }

    return currentTask
  }

  const ensureStarted = (): void => {
    if (!startedAt) {
      throw new Error("Session has not started.")
    }
  }

  const generateCurrentTask = (previousTask?: Task): Task => {
    const skill = skillSequence[currentIndex]
    return generateTaskForSkill({
      skill,
      difficulty: difficultyBySkill[skill],
      locale: sessionLocale,
      rng,
      index: currentIndex,
      previousTask,
    })
  }

  return {
    start(config) {
      sessionId = config.seed ?? buildSessionSeed()
      rng = createSeededRng(sessionId)
      startedAt = new Date().toISOString()
      finishedAt = ""
      const nextLength = Math.round(config.length)
      length = Number.isFinite(nextLength) ? Math.max(1, nextLength) : 5
      sessionLocale = config.locale
      skillSequence = buildSkillSequence({
        length,
        rng,
        mode: config.mode ?? "mixed",
      })
      currentIndex = 0
      currentHintLevel = 0
      attempts = []
      finished = false
      currentTask = generateCurrentTask()
    },

    getCurrentTask() {
      return ensureCurrentTask()
    },

    submitAnswer(input) {
      const task = ensureCurrentTask()
      const isCorrect = matchesAnswer(task, input.value)

      const attempt: AttemptRecord = {
        taskId: task.id,
        skill: task.skill,
        isCorrect,
        value: input.value,
        responseMs: Math.max(0, Math.round(input.responseMs)),
        hintLevelUsed: currentHintLevel,
      }

      attempts.push(attempt)

      updateDifficulty({
        skill: task.skill,
        isCorrect,
        responseMs: attempt.responseMs,
        hintLevelUsed: attempt.hintLevelUsed,
        difficultyBySkill,
        streakBySkill,
      })

      const hasNextTask = currentIndex + 1 < length

      if (hasNextTask) {
        currentIndex += 1
        currentTask = generateCurrentTask(task)
        currentHintLevel = 0
      } else {
        finished = true
        currentTask = null
      }

      return {
        isCorrect,
        nextTaskReady: hasNextTask,
      }
    },

    useHint() {
      const task = ensureCurrentTask()

      if (currentHintLevel === 2) {
        return { hintLevel: 2 as const, message: task.hints[1] }
      }

      currentHintLevel = (currentHintLevel + 1) as 1 | 2

      return {
        hintLevel: currentHintLevel,
        message: task.hints[currentHintLevel - 1],
      }
    },

    finish() {
      ensureStarted()

      if (!finished && attempts.length < length) {
        throw new Error("Cannot finish session before all tasks are answered.")
      }

      finishedAt = new Date().toISOString()

      const bySkill = createEmptySkillStats()
      let correct = 0
      let hintUses = 0
      let totalResponseMs = 0

      for (const attempt of attempts) {
        bySkill[attempt.skill].total += 1
        if (attempt.isCorrect) {
          correct += 1
          bySkill[attempt.skill].correct += 1
        }

        hintUses += attempt.hintLevelUsed
        totalResponseMs += attempt.responseMs
      }

      return {
        sessionId,
        startedAt,
        finishedAt,
        totalTasks: attempts.length,
        correct,
        hintUses,
        avgResponseMs:
          attempts.length > 0 ? Math.round(totalResponseMs / attempts.length) : 0,
        bySkill,
        nextDifficultyBySkill: {
          ...difficultyBySkill,
        },
      }
    },

    getProgress() {
      return {
        current: Math.min(currentIndex + 1, length),
        completed: attempts.length,
        total: length,
      }
    },

    getCurrentHintLevel() {
      return currentHintLevel
    },
  }
}
