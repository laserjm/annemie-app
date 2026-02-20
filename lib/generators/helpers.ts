import type { Difficulty } from "@/lib/domain/task"
import type { Rng } from "@/lib/generators/rng"
import { randomInt, shuffle } from "@/lib/generators/rng"
import type { CrossingRule, ValueRange } from "@/lib/skills/registry"

const FLASH_MS_BY_DIFFICULTY: Record<Difficulty, number> = {
  1: 850,
  2: 700,
  3: 600,
  4: 500,
  5: 420,
}

export const pickFlashMs = (difficulty: Difficulty): number => FLASH_MS_BY_DIFFICULTY[difficulty]

const normalizeRange = (range: ValueRange): ValueRange => {
  if (range.min <= range.max) {
    return range
  }

  return {
    min: range.max,
    max: range.min,
  }
}

export const buildNumberChoices = (
  rng: Rng,
  correct: number,
  min: number,
  max: number,
  size = 4
): number[] => {
  const values = new Set<number>([correct])

  while (values.size < size) {
    const candidate = randomInt(rng, min, max)
    values.add(candidate)
  }

  return shuffle(rng, [...values])
}

export const pickTenFrameCount = (rng: Rng, range: ValueRange): number => {
  const normalizedRange = normalizeRange(range)
  return randomInt(rng, normalizedRange.min, normalizedRange.max)
}

export const pickMissingToTenStart = (rng: Rng, range: ValueRange): number => {
  const normalizedRange = normalizeRange(range)
  return randomInt(rng, normalizedRange.min, normalizedRange.max)
}

export const pickBridgeSubtractPair = (input: {
  rng: Rng
  startRange: ValueRange
  subtractRange: ValueRange
  base: number
  crossingRule: CrossingRule
}): { start: number; subtract: number } => {
  const startRange = normalizeRange(input.startRange)
  const subtractRange = normalizeRange(input.subtractRange)

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const start = randomInt(input.rng, startRange.min, startRange.max)
    const subtractMax = Math.min(subtractRange.max, start - 1)

    if (subtractMax < subtractRange.min) {
      continue
    }

    const subtract = randomInt(input.rng, subtractRange.min, subtractMax)
    const crossesBase = start > input.base && start - subtract < input.base

    if (input.crossingRule !== "crossBaseRequired" || crossesBase) {
      return { start, subtract }
    }
  }

  const fallbackStart = Math.max(startRange.min, input.base + 1)
  const fallbackSubtractMax = Math.min(subtractRange.max, fallbackStart - 1)
  const fallbackSubtract = Math.max(
    subtractRange.min,
    Math.min(fallbackSubtractMax, fallbackStart - input.base + 1)
  )

  return {
    start: fallbackStart,
    subtract: fallbackSubtract,
  }
}
