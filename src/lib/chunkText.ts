// Characters that mark the end of a sentence.
const SENTENCE_TERMINATORS = new Set(['.', '!', '?'])

// A chunk with fewer words than this threshold is considered a short fragment
// (e.g. "OK.", "Wait!") and gets glued onto the preceding sentence instead of
// standing alone. Threshold of 2 means only single-word fragments are merged;
// raising it would incorrectly absorb normal short sentences like "I see."
const FRAGMENT_WORD_THRESHOLD = 2

// Words that end with a period but are NOT sentence boundaries.
// When a '.' immediately follows one of these (case-insensitive), we skip
// the split so "Mr. Smith" stays in one chunk rather than becoming two blocks.
const ABBREVIATIONS = new Set([
  // Titles
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'rev', 'esq',
  // Military / official ranks
  'gen', 'sgt', 'lt', 'cpl', 'pvt', 'maj', 'capt', 'col', 'adm', 'brig',
  // Places / addresses
  'st', 'mt', 'ft', 'blvd', 'ave', 'rd',
  // Latin / common shorthand
  'vs', 'etc', 'eg', 'ie', 'approx', 'est',
  // Academic / publishing
  'dept', 'govt', 'fig', 'vol', 'no', 'pp', 'ch',
])

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
    // potential sentence boundary — but first check it isn't an abbreviation.
    if (SENTENCE_TERMINATORS.has(ch)) {
      const next = text[i + 1]
      if (next !== undefined && /\s/.test(next)) {
        // Extract the word that just ended (letters/digits before the terminator).
        const wordMatch = current.match(/(\w+)[.!?]$/)
        const word = wordMatch ? wordMatch[1].toLowerCase() : ''

        if (ABBREVIATIONS.has(word)) {
          // e.g. "Mr. " — keep accumulating, not a real sentence end.
          continue
        }

        // Real sentence boundary: seal and advance past the whitespace gap.
        parts.push(current)
        current = ''
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
