import type { Difficulty, MissingToTenTask } from "@/lib/domain/task"
import { t } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/types"
import { buildNumberChoices, pickMissingToTenStart } from "@/lib/generators/helpers"
import type { Rng } from "@/lib/generators/rng"
import type { SkillDifficultyConfig } from "@/lib/skills/registry"

export const generateMissingToTenTask = (input: {
  difficulty: Difficulty
  difficultyConfig: SkillDifficultyConfig
  locale: Locale
  rng: Rng
  index: number
}): MissingToTenTask => {
  const start = pickMissingToTenStart(input.rng, input.difficultyConfig.range)
  const target = input.difficultyConfig.base
  const correct = target - start

  return {
    id: `maketen-${input.index}-${start}`,
    type: "missingToTen",
    skill: "makeTen",
    difficulty: input.difficulty,
    prompt: t(input.locale, "task.makeTen.prompt"),
    stimulus: {
      start,
      target,
      equation: `${start} + ? = ${target}`,
    },
    interaction: {
      mode: "singleChoice",
      options: buildNumberChoices(input.rng, correct, 1, Math.max(2, target - 1)),
    },
    answer: {
      correct,
    },
    hints: [
      t(input.locale, "task.makeTen.hint1"),
      t(input.locale, "task.makeTen.hint2", { start }),
    ],
    scoring: {
      maxPoints: 100,
      speedBonusMs: 3000,
    },
  }
}
