import { describe, expect, it } from 'vitest'
import { createPlan, defaultProfile, estimateNutrition } from './coach'

describe('Coach program and nutrition services', () => {
  it('creates a weekly program using the selected location and requested day count', () => {
    const plan = createPlan({ ...defaultProfile, place: 'HOME', days: 4, level: 'Beginner' })
    expect(plan.days).toHaveLength(4)
    expect(plan.days.every((day) => day.exercises.length > 0)).toBe(true)
  })
  it('returns finite, positive approximate nutrition estimates for valid inputs', () => {
    const result = estimateNutrition(defaultProfile)
    expect(result.calories).toBeGreaterThan(0)
    expect(result.protein).toBeGreaterThan(0)
    expect(Number.isFinite(result.carbs)).toBe(true)
  })
})
