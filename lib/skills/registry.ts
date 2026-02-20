import type { Difficulty, Skill, Task } from "@/lib/domain/task"
import { generateBackToTenSubtractTask } from "@/lib/generators/back-to-ten-subtract"
import { generateMissingToTenTask } from "@/lib/generators/missing-to-ten"
import type { Rng } from "@/lib/generators/rng"
import { generateTenFrameFlashTask } from "@/lib/generators/ten-frame"
import type { Locale } from "@/lib/i18n/types"

type SkillTaskGeneratorInput = {
  difficulty: Difficulty
  locale: Locale
  rng: Rng
  index: number
}

export type SkillDifficultyConfig = {
  speedThresholdMs: number
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

const QUANTITY_SPEED_THRESHOLDS: Record<Difficulty, number> = {
  1: 4500,
  2: 4200,
  3: 3800,
  4: 3400,
  5: 3000,
}

const MAKE_TEN_SPEED_THRESHOLDS: Record<Difficulty, number> = {
  1: 5000,
  2: 4700,
  3: 4300,
  4: 3900,
  5: 3600,
}

const BRIDGE_SUBTRACT_SPEED_THRESHOLDS: Record<Difficulty, number> = {
  1: 5500,
  2: 5100,
  3: 4700,
  4: 4300,
  5: 4000,
}

const SKILL_ORDER: Skill[] = ["quantity", "makeTen", "bridgeSubtract"]

export const SKILL_REGISTRY: Record<Skill, SkillDefinition> = {
  quantity: {
    id: "quantity",
    labelKey: "skill.quantity",
    icon: "👀",
    difficultyLevels: ALL_DIFFICULTY_LEVELS,
    getDifficultyConfig: (difficulty) => ({
      speedThresholdMs: QUANTITY_SPEED_THRESHOLDS[difficulty],
    }),
    generateTask: generateTenFrameFlashTask,
  },
  makeTen: {
    id: "makeTen",
    labelKey: "skill.makeTen",
    icon: "🧩",
    difficultyLevels: ALL_DIFFICULTY_LEVELS,
    getDifficultyConfig: (difficulty) => ({
      speedThresholdMs: MAKE_TEN_SPEED_THRESHOLDS[difficulty],
    }),
    generateTask: generateMissingToTenTask,
  },
  bridgeSubtract: {
    id: "bridgeSubtract",
    labelKey: "skill.bridgeSubtract",
    icon: "✂️",
    difficultyLevels: ALL_DIFFICULTY_LEVELS,
    getDifficultyConfig: (difficulty) => ({
      speedThresholdMs: BRIDGE_SUBTRACT_SPEED_THRESHOLDS[difficulty],
    }),
    generateTask: generateBackToTenSubtractTask,
  },
}

export const getSkillDefinition = (skill: Skill): SkillDefinition => {
  return SKILL_REGISTRY[skill]
}

export const listSkills = (): Skill[] => {
  return [...SKILL_ORDER]
}
