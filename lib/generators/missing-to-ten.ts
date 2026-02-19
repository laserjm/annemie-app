import type { Difficulty, MissingToTenTask } from "@/lib/domain/task"
import { buildNumberChoices, pickMissingToTenStart } from "@/lib/generators/helpers"
import type { Rng } from "@/lib/generators/rng"

export const generateMissingToTenTask = (input: {
  difficulty: Difficulty
  rng: Rng
  index: number
}): MissingToTenTask => {
  const start = pickMissingToTenStart(input.rng, input.difficulty)
  const correct = 10 - start

  return {
    id: `maketen-${input.index}-${start}`,
    type: "missingToTen",
    skill: "makeTen",
    difficulty: input.difficulty,
    prompt: "What number completes ten?",
    stimulus: {
      start,
      target: 10,
      equation: `${start} + ? = 10`,
    },
    interaction: {
      mode: "singleChoice",
      options: buildNumberChoices(input.rng, correct, 1, 9),
    },
    answer: {
      correct,
    },
    hints: [
      "Think of ten as 5 + 5. How far is your number from 10?",
      `Count up from ${start} to 10 with your fingers.`,
    ],
    scoring: {
      maxPoints: 100,
      speedBonusMs: 3000,
    },
  }
}
