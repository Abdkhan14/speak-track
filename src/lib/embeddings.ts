export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1)
}

export function rankSentences(
  query: number[],
  sentenceVecs: number[][],
  k = 5,
): { index: number; score: number }[] {
  return sentenceVecs
    .map((vec, index) => ({ index, score: cosine(query, vec) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
}
