import { describe, it, expect } from 'vitest'
import { overlapScore, pickLine } from './aligner'

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
