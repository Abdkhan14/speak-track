import { describe, it, expect } from 'vitest'
import { chunkSentences } from './chunkText'

describe('chunkSentences', () => {
  it('splits two sentences on a period', () => {
    expect(chunkSentences('Hello, friends. Today we ship.')).toEqual([
      'Hello, friends.',
      'Today we ship.',
    ])
  })

  it('splits on exclamation mark', () => {
    expect(chunkSentences('Watch out! The bridge is out.')).toEqual([
      'Watch out!',
      'The bridge is out.',
    ])
  })

  it('splits on question mark', () => {
    expect(chunkSentences('Are you ready? Let us begin.')).toEqual([
      'Are you ready?',
      'Let us begin.',
    ])
  })

  it('glues a single-word fragment onto the previous sentence', () => {
    // "OK." is only 1 word — gets merged onto "That is fine."
    expect(chunkSentences('That is fine. OK. Now we continue.')).toEqual([
      'That is fine. OK.',
      'Now we continue.',
    ])
  })

  it('returns an empty array for an empty string', () => {
    expect(chunkSentences('')).toEqual([])
  })

  it('returns the whole string when there is no sentence terminator', () => {
    expect(chunkSentences('This has no terminator')).toEqual([
      'This has no terminator',
    ])
  })

  it('handles multiple spaces between sentences', () => {
    expect(chunkSentences('First sentence.   Second sentence.')).toEqual([
      'First sentence.',
      'Second sentence.',
    ])
  })

  it('handles newlines between sentences', () => {
    expect(chunkSentences('First sentence.\nSecond sentence.')).toEqual([
      'First sentence.',
      'Second sentence.',
    ])
  })

  it('does not split on common abbreviations (Mr., Mrs., Dr., St., etc.)', () => {
    expect(
      chunkSentences(
        'Mr. and Mrs. Dursley were proud. Dr. Smith agreed. St. Brutus was nearby.',
      ),
    ).toEqual([
      'Mr. and Mrs. Dursley were proud.',
      'Dr. Smith agreed.',
      'St. Brutus was nearby.',
    ])
  })
})
