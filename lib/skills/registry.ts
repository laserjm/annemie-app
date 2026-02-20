import type { Difficulty, Skill, Task } from "@/lib/domain/task"
import { generateBackToTenSubtractTask } from "@/lib/generators/back-to-ten-subtract"
import { generateMissingToTenTask } from "@/lib/generators/missing-to-ten"
import type { Rng } from "@/lib/generators/rng"
import { generateTenFrameFlashTask } from "@/lib/generators/ten-frame"
import type { Locale } from "@/lib/i18n/types"

export type ValueRange = {
  min: number
  max: number
}

export type CrossingRule = "none" | "reachBase" | "crossBaseRequired"

export type SkillDifficultyConfig = {
  speedThresholdMs: number
  base: number
  crossingRule: CrossingRule
  range: ValueRange
  secondaryRange?: ValueRange
}

export type SkillTaskGeneratorInput = {
  difficulty: Difficulty
  difficultyConfig: SkillDifficultyConfig
  locale: Locale
  rng: Rng
  index: number
}

export type SkillDefinition = {
  id: Skill
  labelKey: `skill.${string}`
  icon: string
  difficultyLevels: readonly Difficulty[]
  getDifficultyConfig: (difficulty: Difficulty) => SkillDifficultyConfig
  generateTask: (input: SkillTaskGeneratorInput) => Task
}

const ALL_DIFFICULTY_LEVELS: readonly Difficulty[] = [1, 2, 3, 4, 5]

const QUANTITY_CONFIG_BY_DIFFICULTY: Record<Difficulty, SkillDifficultyConfig> = {
  1: {
    speedThresholdMs: 4500,
    base: 10,
    crossingRule: "none",
    range: { min: 1, max: 5 },
  },
  2: {
    speedThresholdMs: 4200,
    base: 10,
    crossingRule: "none",
    range: { min: 1, max: 7 },
  },
  3: {
    speedThresholdMs: 3800,
    base: 10,
    crossingRule: "none",
    range: { min: 2, max: 10 },
  },
  4: {
    speedThresholdMs: 3400,
    base: 10,
    crossingRule: "none",
    range: { min: 3, max: 10 },
  },
  5: {
    speedThresholdMs: 3000,
    base: 10,
    crossingRule: "none",
    range: { min: 1, max: 10 },
  },
}

const MAKE_TEN_CONFIG_BY_DIFFICULTY: Record<Difficulty, SkillDifficultyConfig> = {
  1: {
    speedThresholdMs: 5000,
    base: 10,
    crossingRule: "reachBase",
    range: { min: 6, max: 9 },
  },
  2: {
    speedThresholdMs: 4700,
    base: 10,
    crossingRule: "reachBase",
    range: { min: 6, max: 9 },
  },
  3: {
    speedThresholdMs: 4300,
    base: 10,
    crossingRule: "reachBase",
    range: { min: 7, max: 9 },
  },
  4: {
    speedThresholdMs: 3900,
    base: 10,
    crossingRule: "reachBase",
    range: { min: 7, max: 9 },
  },
  5: {
    speedThresholdMs: 3600,
    base: 10,
    crossingRule: "reachBase",
    range: { min: 8, max: 9 },
  },
}

const BRIDGE_SUBTRACT_CONFIG_BY_DIFFICULTY: Record<Difficulty, SkillDifficultyConfig> =
  {
    1: {
      speedThresholdMs: 5500,
      base: 10,
      crossingRule: "crossBaseRequired",
      range: { min: 11, max: 13 },
      secondaryRange: { min: 2, max: 4 },
    },
    2: {
      speedThresholdMs: 5100,
      base: 10,
      crossingRule: "crossBaseRequired",
      range: { min: 11, max: 15 },
      secondaryRange: { min: 2, max: 5 },
    },
    3: {
      speedThresholdMs: 4700,
      base: 10,
      crossingRule: "crossBaseRequired",
      range: { min: 12, max: 16 },
      secondaryRange: { min: 3, max: 6 },
    },
    4: {
      speedThresholdMs: 4300,
      base: 10,
      crossingRule: "crossBaseRequired",
      range: { min: 13, max: 18 },
      secondaryRange: { min: 4, max: 8 },
    },
    5: {
      speedThresholdMs: 4000,
      base: 10,
      crossingRule: "crossBaseRequired",
      range: { min: 14, max: 19 },
      secondaryRange: { min: 5, max: 9 },
    },
  }

const SKILL_ORDER: Skill[] = ["quantity", "makeTen", "bridgeSubtract"]

export const SKILL_REGISTRY: Record<Skill, SkillDefinition> = {
  quantity: {
    id: "quantity",
    labelKey: "skill.quantity",
    icon: "👀",
    difficultyLevels: ALL_DIFFICULTY_LEVELS,
    getDifficultyConfig: (difficulty) => QUANTITY_CONFIG_BY_DIFFICULTY[difficulty],
    generateTask: generateTenFrameFlashTask,
  },
  makeTen: {
    id: "makeTen",
    labelKey: "skill.makeTen",
    icon: "🧩",
    difficultyLevels: ALL_DIFFICULTY_LEVELS,
    getDifficultyConfig: (difficulty) => MAKE_TEN_CONFIG_BY_DIFFICULTY[difficulty],
    generateTask: generateMissingToTenTask,
  },
  bridgeSubtract: {
    id: "bridgeSubtract",
    labelKey: "skill.bridgeSubtract",
    icon: "✂️",
    difficultyLevels: ALL_DIFFICULTY_LEVELS,
    getDifficultyConfig: (difficulty) =>
      BRIDGE_SUBTRACT_CONFIG_BY_DIFFICULTY[difficulty],
    generateTask: generateBackToTenSubtractTask,
  },
}

export const getSkillDefinition = (skill: Skill): SkillDefinition => {
  return SKILL_REGISTRY[skill]
}

export const listSkills = (): Skill[] => {
  return [...SKILL_ORDER]
}
