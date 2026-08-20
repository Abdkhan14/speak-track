// Minimum overlapScore for word-follow to accept a match without falling back
// to embedding. Reused by the follow loop in later PRs.
export const WORD_FOLLOW_THRESHOLD = 0.45

// How much better the new winner must score over the current line before the
// highlight is allowed to jump more than one sentence. Prevents flickering when
// two nearby lines share common words.
export const STICKINESS_MARGIN = 0.15

// How many consecutive weak word-follow results must accumulate before the
// follow loop falls back to embedding. Keeps API calls rare.
export const LOST_BEFORE_MEANING = 3

// Minimum cosine similarity for an embedding result to justify a jump.
// Below this the cursor stays put even after the embedding call.
export const MEANING_THRESHOLD = 0.4

// Normalises a string into a list of lowercase alphanumeric tokens.
// Strips punctuation so "hello," matches "hello" across script and transcript.
export function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
}

// Returns the fraction of heard words that appear in the tokenized line.
// Returns 0 when heard is empty to avoid division-by-zero.
// The heard array is expected to be pre-tokenized (lowercase, no punctuation).
export function overlapScore(heard: string[], line: string): number {
  const set = new Set(tokenize(line))
  if (heard.length === 0) return 0
  return heard.filter((w) => set.has(w)).length / heard.length
}

// Applies stickiness: the new winner index is accepted when:
//   - it equals cursor (no movement)
//   - it is exactly cursor + 1 (natural forward progress)
//   - its score beats the current line's score by more than margin (clear win)
// Any other case keeps the cursor in place to avoid flickering.
export function sticky(
  cursor: number,
  winner: { index: number; score: number },
  currentScore: number,
  margin = STICKINESS_MARGIN,
): number {
  if (winner.index === cursor) return cursor
  if (winner.index === cursor + 1) return winner.index
  if (winner.score > currentScore + margin) return winner.index
  return cursor
}

// Finds the best-matching sentence index within a window around the cursor.
// Window: [cursor-1, cursor+2] clamped to array bounds.
// Seeding best with cursor's own score means that when all candidates tie
// (including when all score 0), the aligner stays put rather than jumping to
// whichever candidate happens to be first in the loop.
export function pickLine(
  heard: string[],
  sentences: string[],
  cursor: number,
): { index: number; score: number } {
  const start = Math.max(0, cursor - 1)
  const end = Math.min(sentences.length - 1, cursor + 2)
  let best = { index: cursor, score: overlapScore(heard, sentences[cursor]) }
  for (let i = start; i <= end; i++) {
    const score = overlapScore(heard, sentences[i])
    if (score > best.score) best = { index: i, score }
  }
  return best
}
