import type { Difficulty, Skill, Task } from "@/lib/domain/task"
import { getTaskSignature } from "@/lib/domain/task"
import { generateBackToTenSubtractTask } from "@/lib/generators/back-to-ten-subtract"
import { generateMissingToTenTask } from "@/lib/generators/missing-to-ten"
import type { Rng } from "@/lib/generators/rng"
import { pickWeighted, randomInt, shuffle } from "@/lib/generators/rng"
import { generateTenFrameFlashTask } from "@/lib/generators/ten-frame"

export const generateTaskForSkill = (input: {
  skill: Skill
  difficulty: Difficulty
  rng: Rng
  index: number
  previousTask?: Task
}): Task => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const task = generateSingleTask(input)

    if (!input.previousTask) {
      return task
    }

    if (getTaskSignature(task) !== getTaskSignature(input.previousTask)) {
      return task
    }
  }

  return generateSingleTask(input)
}

const generateSingleTask = (input: {
  skill: Skill
  difficulty: Difficulty
  rng: Rng
  index: number
}): Task => {
  switch (input.skill) {
    case "quantity":
      return generateTenFrameFlashTask(input)
    case "makeTen":
      return generateMissingToTenTask(input)
    case "bridgeSubtract":
      return generateBackToTenSubtractTask(input)
    default:
      throw new Error(`Unsupported skill: ${String(input.skill)}`)
  }
}

export const buildSkillSequence = (input: {
  length: number
  rng: Rng
  focusSkill?: Skill | null
}): Skill[] => {
  const base: Skill[] = ["quantity", "makeTen", "bridgeSubtract"]

  const extraCount = Math.max(0, input.length - base.length)
  const extras: Skill[] = []

  for (let index = 0; index < extraCount; index += 1) {
    const skill = pickWeighted(input.rng, getSkillWeights(input.focusSkill))
    extras.push(skill)
  }

  return shuffle(input.rng, [...base, ...extras]).slice(0, input.length)
}

const getSkillWeights = (
  focusSkill?: Skill | null
): Array<{ value: Skill; weight: number }> => {
  if (!focusSkill) {
    return [
      { value: "quantity", weight: 1 },
      { value: "makeTen", weight: 1 },
      { value: "bridgeSubtract", weight: 1 },
    ]
  }

  return [
    { value: focusSkill, weight: 3 },
    { value: focusSkill === "quantity" ? "makeTen" : "quantity", weight: 1 },
    {
      value:
        focusSkill === "bridgeSubtract"
          ? "makeTen"
          : "bridgeSubtract",
      weight: 1,
    },
  ]
}

export const buildSessionSeed = (): string => {
  const now = Date.now().toString(36)
  const entropy = randomInt(Math.random, 1000, 99999)
  return `${now}-${entropy}`
}
