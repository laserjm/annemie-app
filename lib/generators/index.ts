import type { Difficulty, Skill, Task } from "@/lib/domain/task"
import type { Locale } from "@/lib/i18n/types"
import { getTaskSignature } from "@/lib/domain/task"
import type { Rng } from "@/lib/generators/rng"
import { pickWeighted, randomInt, shuffle } from "@/lib/generators/rng"
import { getSkillDefinition, listSkills } from "@/lib/skills/registry"

export type SessionMode = "mixed" | Skill

export const generateTaskForSkill = (input: {
  skill: Skill
  difficulty: Difficulty
  locale: Locale
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
  locale: Locale
  rng: Rng
  index: number
}): Task => {
  const skillDefinition = getSkillDefinition(input.skill)
  return skillDefinition.generateTask(input)
}

export const buildSkillSequence = (input: {
  length: number
  rng: Rng
  mode: SessionMode
}): Skill[] => {
  if (input.length <= 0) {
    return []
  }

  if (input.mode !== "mixed") {
    const selectedSkill: Skill = input.mode
    return Array.from({ length: input.length }, () => selectedSkill)
  }

  const availableSkills = listSkills()
  const base: Skill[] = [...availableSkills]
  const extraCount = Math.max(0, input.length - availableSkills.length)
  const extras = Array.from({ length: extraCount }, () =>
    pickWeighted(
      input.rng,
      availableSkills.map((skill) => ({ value: skill, weight: 1 }))
    )
  )

  return shuffle(input.rng, [...base, ...extras]).slice(0, input.length)
}

export const buildSessionSeed = (): string => {
  const now = Date.now().toString(36)
  const entropy = randomInt(Math.random, 1000, 99999)
  return `${now}-${entropy}`
}
