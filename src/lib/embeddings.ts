// Measures how similar two embedding vectors are.
// Returns 1 for identical direction (same meaning), 0 for unrelated,
// and values in between for partial matches. The `|| 1` guard prevents
// division by zero when either vector is all zeros.
export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]   // dot product
    na  += a[i] * a[i]   // squared magnitude of a
    nb  += b[i] * b[i]   // squared magnitude of b
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1)
}

// Sends all sentences to OpenAI in one batch POST to /api/embed (proxied by
// Vite to hide the API key). Returns vectors in the same order as the input.
// Throws if the response is not ok so the caller can surface the error.
export async function embedSentences(sentences: string[]): Promise<number[][]> {
  const res = await fetch('/api/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: sentences }),
  })
  if (!res.ok) throw new Error(`embed failed: ${res.status}`)
  const json = await res.json() as { data: { index: number; embedding: number[] }[] }
  // OpenAI may return items out of order — sort by index before returning.
  return [...json.data]
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding)
}

// Scores every sentence vector against a query vector, then returns the
// top-k closest sentences in descending order with their original indexes.
// Used by later PRs to jump to the best-matching line when word-overlap fails.
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
