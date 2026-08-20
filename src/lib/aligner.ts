// Minimum overlapScore for word-follow to accept a match without falling back
// to embedding. Reused by the follow loop in later PRs.
export const WORD_FOLLOW_THRESHOLD = 0.45

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
