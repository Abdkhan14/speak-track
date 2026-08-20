export function chunkSentences(text: string): string[] {
  // Walk the string character-by-character to avoid lookbehind assertions
  // that some transpilers mis-handle inside split().
  const terminators = new Set(['.', '!', '?'])
  const parts: string[] = []
  let current = ''

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    current += ch

    if (terminators.has(ch)) {
      const next = text[i + 1]
      if (next !== undefined && /\s/.test(next)) {
        parts.push(current)
        current = ''
        while (i + 1 < text.length && /\s/.test(text[i + 1])) {
          i++
        }
      }
    }
  }

  const trimmed = current.trim()
  if (trimmed) parts.push(trimmed)

  // Merge single-word fragments (e.g. "OK.", "Wait!") onto the preceding sentence.
  // We check the CURRENT part's word count: only < 2 words (exactly 1 word) triggers
  // a merge so that normal 2+-word sentences are never incorrectly glued together.
  const merged: string[] = []
  for (const part of parts) {
    const t = part.trim()
    if (!t) continue
    const last = merged[merged.length - 1]
    if (last && t.split(/\s+/).length < 2) {
      merged[merged.length - 1] = `${last} ${t}`
    } else {
      merged.push(t)
    }
  }
  return merged
}
