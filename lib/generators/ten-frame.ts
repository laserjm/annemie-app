import type { Difficulty, TenFrameFlashTask } from "@/lib/domain/task"
import { t } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/types"
import { buildNumberChoices, pickFlashMs, pickTenFrameCount } from "@/lib/generators/helpers"
import type { Rng } from "@/lib/generators/rng"
import type { SkillDifficultyConfig } from "@/lib/skills/registry"

export const generateTenFrameFlashTask = (input: {
  difficulty: Difficulty
  difficultyConfig: SkillDifficultyConfig
  locale: Locale
  rng: Rng
  index: number
}): TenFrameFlashTask => {
  const count = pickTenFrameCount(input.rng, input.difficultyConfig.range)

  return {
    id: `quantity-${input.index}-${count}`,
    type: "tenFrameFlashCount",
    skill: "quantity",
    difficulty: input.difficulty,
    prompt: t(input.locale, "task.quantity.prompt"),
    stimulus: {
      count,
      flashMs: pickFlashMs(input.difficulty),
      layout: "tenFrame",
    },
    interaction: {
      mode: "singleChoice",
      options: buildNumberChoices(input.rng, count, 1, 10),
    },
    answer: {
      correct: count,
    },
    hints: [
      t(input.locale, "task.quantity.hint1"),
      t(input.locale, "task.quantity.hint2"),
    ],
    scoring: {
      maxPoints: 100,
      speedBonusMs: 2500,
    },
  }
}
