import { describe, expect, it } from 'vitest'

/**
 * Simple addition function
 * @param a First number
 * @param b Second number
 * @returns Sum of a and b
 */
export function add(a: number, b: number): number {
  return a + b
}

describe('add function', () => {
  it('should correctly add two positive numbers', () => {
    expect(add(2, 3)).toBe(5)
  })

  it('should correctly add a positive and negative number', () => {
    expect(add(5, -3)).toBe(2)
  })

  it('should correctly add two negative numbers', () => {
    expect(add(-2, -3)).toBe(-5)
  })

  it('should correctly add zero to a number', () => {
    expect(add(7, 0)).toBe(7)
  })
})
