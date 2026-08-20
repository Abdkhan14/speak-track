// Characters that mark the end of a sentence.
const SENTENCE_TERMINATORS = new Set(['.', '!', '?'])

// A chunk with fewer words than this threshold is considered a short fragment
// (e.g. "OK.", "Wait!") and gets glued onto the preceding sentence instead of
// standing alone. Threshold of 2 means only single-word fragments are merged;
// raising it would incorrectly absorb normal short sentences like "I see."
const FRAGMENT_WORD_THRESHOLD = 2

export function chunkSentences(text: string): string[] {
  // --- Phase 1: split into raw sentence parts ---
  // Walk character-by-character rather than using a lookbehind regex, because
  // some transpilers (e.g. oxc) mis-handle lookbehind assertions inside split().
  const parts: string[] = []
  let current = ''

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    current += ch

    // When we hit a terminator that is followed by whitespace, we've reached a
    // sentence boundary — seal the current sentence and advance past the gap.
    if (SENTENCE_TERMINATORS.has(ch)) {
      const next = text[i + 1]
      if (next !== undefined && /\s/.test(next)) {
        parts.push(current)
        current = ''
        // Consume all whitespace so the next sentence starts clean.
        while (i + 1 < text.length && /\s/.test(text[i + 1])) {
          i++
        }
      }
    }
  }

  // Whatever remains after the last terminator (or the whole string if there
  // were no terminators) is the final chunk.
  const trimmed = current.trim()
  if (trimmed) parts.push(trimmed)

  // --- Phase 2: merge short fragments onto the preceding sentence ---
  // A single-word exclamation like "OK." or "Wait!" reads better attached to
  // the sentence before it than displayed on its own line.
  const merged: string[] = []
  for (const part of parts) {
    const t = part.trim()
    if (!t) continue

    const last = merged[merged.length - 1]
    const isFragment = t.split(/\s+/).length < FRAGMENT_WORD_THRESHOLD

    if (last && isFragment) {
      // Glue this short fragment onto the end of the preceding sentence.
      merged[merged.length - 1] = `${last} ${t}`
    } else {
      merged.push(t)
    }
  }

  return merged
}
