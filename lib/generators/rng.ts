export type Rng = () => number

const hashSeed = (seed: string): number => {
  let hash = 2166136261

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

const mulberry32 = (seed: number): Rng => {
  let value = seed || 1

  return () => {
    value += 0x6d2b79f5
    let t = value
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const createSeededRng = (seed: string): Rng => mulberry32(hashSeed(seed))

export const randomInt = (rng: Rng, min: number, max: number): number => {
  const lower = Math.ceil(min)
  const upper = Math.floor(max)
  return Math.floor(rng() * (upper - lower + 1)) + lower
}

export const pickOne = <T>(rng: Rng, values: T[]): T => {
  const index = randomInt(rng, 0, values.length - 1)
  return values[index]
}

export const pickWeighted = <T>(
  rng: Rng,
  options: Array<{ value: T; weight: number }>
): T => {
  const totalWeight = options.reduce((total, option) => total + option.weight, 0)
  const threshold = rng() * totalWeight

  let cumulative = 0

  for (const option of options) {
    cumulative += option.weight
    if (threshold <= cumulative) {
      return option.value
    }
  }

  return options[options.length - 1].value
}

export const shuffle = <T>(rng: Rng, values: T[]): T[] => {
  const clone = [...values]

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(rng, 0, index)
    const current = clone[index]
    clone[index] = clone[swapIndex]
    clone[swapIndex] = current
  }

  return clone
}
