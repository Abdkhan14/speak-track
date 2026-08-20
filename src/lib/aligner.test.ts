import { describe, it, expect } from 'vitest'
import { tokenize, overlapScore, pickLine, sticky } from './aligner'

describe('tokenize', () => {
  it('lowercases, strips punctuation, and splits on whitespace', () => {
    expect(tokenize('Hello, world!')).toEqual(['hello', 'world'])
  })

  it('returns an empty array for an empty string', () => {
    expect(tokenize('')).toEqual([])
  })

  it('handles numbers', () => {
    expect(tokenize('PR 21 is ready')).toEqual(['pr', '21', 'is', 'ready'])
  })
})

describe('overlapScore', () => {
  it('when heard is empty, returns 0', () => {
    expect(overlapScore([], 'hello world')).toBe(0)
  })

  it('when all heard words appear in the line, returns 1', () => {
    expect(overlapScore(['hello', 'world'], 'hello world')).toBe(1)
  })

  it('when no heard words appear in the line, returns 0', () => {
    expect(overlapScore(['foo', 'bar'], 'hello world')).toBe(0)
  })

  it('when half the heard words match, returns 0.5', () => {
    expect(overlapScore(['hello', 'foo', 'world', 'bar'], 'hello world')).toBe(0.5)
  })

  it('strips punctuation from the line before matching', () => {
    // "hello," in the sentence should still match the heard word "hello"
    expect(overlapScore(['hello', 'world'], 'hello, world!')).toBe(1)
  })

  it('matching is case-insensitive', () => {
    expect(overlapScore(['hello', 'world'], 'Hello World')).toBe(1)
  })
})

describe('pickLine', () => {
  const sentences = [
    'the cat sat on the mat',      // 0
    'the dog ran in the park',     // 1
    'the bird flew over the hill', // 2
    'the fish swam in the lake',   // 3
    'the fox jumped over the log', // 4
  ]

  it('when cursor sentence is the best match, returns cursor index', () => {
    const heard = ['cat', 'sat', 'mat']
    const result = pickLine(heard, sentences, 0)
    expect(result.index).toBe(0)
    expect(result.score).toBeGreaterThan(0)
  })

  it('when the next sentence is a better match, advances by 1', () => {
    const heard = ['dog', 'ran', 'park']
    const result = pickLine(heard, sentences, 0)
    expect(result.index).toBe(1)
  })

  it('when a sentence two ahead is the best match, advances by 2', () => {
    const heard = ['bird', 'flew', 'hill']
    const result = pickLine(heard, sentences, 0)
    expect(result.index).toBe(2)
  })

  it('when the previous sentence is the best match, goes back by 1', () => {
    const heard = ['cat', 'sat', 'mat']
    const result = pickLine(heard, sentences, 1)
    expect(result.index).toBe(0)
  })

  it('when cursor is at the start, does not underflow below 0', () => {
    const heard = ['cat', 'sat', 'mat']
    const result = pickLine(heard, sentences, 0)
    expect(result.index).toBeGreaterThanOrEqual(0)
  })

  it('when cursor is at the end, does not overflow past the last index', () => {
    const heard = ['fox', 'jumped', 'log']
    const result = pickLine(heard, sentences, 4)
    expect(result.index).toBeLessThanOrEqual(4)
  })

  it('when all scores are zero, stays at cursor', () => {
    const heard = ['zzz', 'qqq']
    const result = pickLine(heard, sentences, 2)
    expect(result.index).toBe(2)
  })

  it('when heard words are already pre-tokenized lowercase, they match correctly', () => {
    const heard = ['fish', 'swam', 'lake']
    const result = pickLine(heard, sentences, 2)
    expect(result.index).toBe(3)
  })

  it('works correctly with a single-sentence array', () => {
    const result = pickLine(['hello'], ['hello world'], 0)
    expect(result.index).toBe(0)
  })

  it('when the best match is outside the cursor window, stays at cursor', () => {
    // cursor=2, window=[1..4]. sentence 0 is the best match but is out of range.
    const heardSentence0 = ['cat', 'sat', 'mat']
    const result = pickLine(heardSentence0, sentences, 2)
    expect(result.index).toBe(2)
  })
})

describe('sticky', () => {
  it('when winner is the same as cursor, returns cursor', () => {
    expect(sticky(3, { index: 3, score: 0.8 }, 0.8)).toBe(3)
  })

  it('when winner is exactly cursor + 1, always returns cursor + 1', () => {
    // One step forward is always accepted even with no margin at all
    expect(sticky(3, { index: 4, score: 0.46 }, 0.44)).toBe(4)
  })

  it('when winner is cursor + 2 and score exceeds currentScore by more than margin, returns winner', () => {
    expect(sticky(3, { index: 5, score: 0.70 }, 0.45)).toBe(5)
  })

  it('when winner is cursor + 2 and score only barely exceeds currentScore, stays at cursor', () => {
    expect(sticky(3, { index: 5, score: 0.50 }, 0.45)).toBe(3)
  })

  it('when winner is cursor - 1 and does not exceed margin, stays at cursor', () => {
    expect(sticky(3, { index: 2, score: 0.50 }, 0.45)).toBe(3)
  })

  it('when winner is cursor - 1 but score clearly exceeds margin, returns winner', () => {
    expect(sticky(3, { index: 2, score: 0.80 }, 0.45)).toBe(2)
  })
})
