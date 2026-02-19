export type Difficulty = 1 | 2 | 3 | 4 | 5

export type TaskType =
  | "tenFrameFlashCount"
  | "missingToTen"
  | "backToTenSubtract"

export type Skill = "quantity" | "makeTen" | "bridgeSubtract"

export type InteractionMode = "singleChoice" | "tapInput"

export type TaskInteraction =
  | {
      mode: "singleChoice"
      options: number[]
    }
  | {
      mode: "tapInput"
      min: number
      max: number
      options?: number[]
    }

export type TaskAnswer = {
  correct: number | string
  alternatives?: Array<number | string>
}

export type TaskScoring = {
  maxPoints: number
  speedBonusMs?: number
}

type BaseTask<TTaskType extends TaskType, TStimulus> = {
  id: string
  type: TTaskType
  skill: Skill
  difficulty: Difficulty
  prompt?: string
  stimulus: TStimulus
  interaction: TaskInteraction
  answer: TaskAnswer
  hints: [string, string]
  scoring: TaskScoring
}

export type TenFrameFlashStimulus = {
  count: number
  flashMs: number
  layout: "tenFrame"
}

export type MissingToTenStimulus = {
  start: number
  target: 10
  equation: string
}

export type BackToTenSubtractStimulus = {
  start: number
  subtract: number
  bridgeStep: number
  equation: string
}

export type TenFrameFlashTask = BaseTask<"tenFrameFlashCount", TenFrameFlashStimulus>

export type MissingToTenTask = BaseTask<"missingToTen", MissingToTenStimulus>

export type BackToTenSubtractTask = BaseTask<
  "backToTenSubtract",
  BackToTenSubtractStimulus
>

export type Task = TenFrameFlashTask | MissingToTenTask | BackToTenSubtractTask

export type SkillDifficultyMap = Record<Skill, Difficulty>

export type SkillStats = Record<Skill, { correct: number; total: number }>

export const SKILLS: Skill[] = ["quantity", "makeTen", "bridgeSubtract"]

export const clampDifficulty = (value: number): Difficulty => {
  if (value <= 1) {
    return 1
  }

  if (value >= 5) {
    return 5
  }

  return value as Difficulty
}

export const getTaskSignature = (task: Task): string => {
  switch (task.type) {
    case "tenFrameFlashCount":
      return `${task.type}:${task.stimulus.count}`
    case "missingToTen":
      return `${task.type}:${task.stimulus.start}`
    case "backToTenSubtract":
      return `${task.type}:${task.stimulus.start}-${task.stimulus.subtract}`
  }
}
