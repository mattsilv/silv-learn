import { describe, it, expect } from 'vitest'
import { calculateLearningStyle } from './calculateLearningStyle'

describe('calculateLearningStyle', () => {
  it('should calculate percentages correctly for a single dominant style', () => {
    const counts = { a: 10, b: 5, c: 3, d: 2 } // Total 20
    const results = calculateLearningStyle(counts)

    expect(results.visual.percentage).toBe(50) // 10/20
    expect(results.auditory.percentage).toBe(25) // 5/20
    expect(results.reading.percentage).toBe(15) // 3/20
    expect(results.kinesthetic.percentage).toBe(10) // 2/20
    expect(results.multimodal).toBeUndefined()
  })

  it('should identify multimodal style when scores are close', () => {
    const counts = { a: 8, b: 8, c: 2, d: 2 } // Total 20
    const results = calculateLearningStyle(counts)

    expect(results.visual.percentage).toBe(40)
    expect(results.auditory.percentage).toBe(40)
    expect(results.reading.percentage).toBe(10)
    expect(results.kinesthetic.percentage).toBe(10)
    expect(results.multimodal).toBeDefined()
    expect(results.multimodal?.style).toBe('Multimodal')
    expect(results.multimodal?.description).toContain('Visual, Auditory')
    expect(results.multimodal?.score).toBe(8)
    // Percentage calculation for multimodal might need adjustment based on desired logic
    // Current logic: (8+8) / (2 * 20) * 100 = 16/40 * 100 = 40
    expect(results.multimodal?.percentage).toBe(40)
  })

  it('should handle zero counts', () => {
    const counts = { a: 0, b: 0, c: 0, d: 0 }
    // Vitest doesn't automatically fail on NaN, so we check explicitly
    const results = calculateLearningStyle(counts)
    expect(results.visual.percentage).toBeNaN()
    expect(results.auditory.percentage).toBeNaN()
    expect(results.reading.percentage).toBeNaN()
    expect(results.kinesthetic.percentage).toBeNaN()
    expect(results.multimodal).toBeUndefined()
  })

  it('should handle ties for the top score by including all tied styles in multimodal', () => {
    const counts = { a: 5, b: 5, c: 5, d: 5 } // Total 20
    const results = calculateLearningStyle(counts)

    expect(results.multimodal).toBeDefined()
    expect(results.multimodal?.description).toContain(
      'Visual, Auditory, Reading/Writing, Kinesthetic',
    )
    expect(results.multimodal?.score).toBe(5)
    expect(results.multimodal?.percentage).toBe(25) // (5+5+5+5) / (4*20) * 100 = 20/80 * 100
  })
}) 