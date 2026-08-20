import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cosine, rankSentences, embedSentences } from './embeddings'

describe('cosine', () => {
  it('when two identical unit vectors are compared, returns 1', () => {
    expect(cosine([1, 0], [1, 0])).toBeCloseTo(1)
  })

  it('when two orthogonal vectors are compared, returns 0', () => {
    expect(cosine([1, 0], [0, 1])).toBeCloseTo(0)
  })

  it('when a similar but non-identical vector is compared, returns a value between 0 and 1', () => {
    const score = cosine([1, 0], [0.8, 0.6])
    expect(score).toBeCloseTo(0.8)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1)
  })

  it('when a zero vector is compared to any vector, returns a finite number and not NaN', () => {
    const score = cosine([0, 0], [1, 0])
    expect(Number.isFinite(score)).toBe(true)
    expect(Number.isNaN(score)).toBe(false)
  })
})

describe('rankSentences', () => {
  it('when given three vectors and k=2, returns the top 2 results in descending score order', () => {
    const query = [1, 0]
    const vecs = [
      [1, 0],     // sentence 0 — identical
      [0, 1],     // sentence 1 — unrelated
      [0.8, 0.6], // sentence 2 — similar
    ]
    const result = rankSentences(query, vecs, 2)
    expect(result).toHaveLength(2)
    expect(result[0].index).toBe(0)
    expect(result[0].score).toBeCloseTo(1)
    expect(result[1].index).toBe(2)
    expect(result[1].score).toBeCloseTo(0.8)
  })

  it('preserves the original sentence index regardless of sort position', () => {
    const query = [0, 1]
    const vecs = [
      [1, 0], // sentence 0 — unrelated
      [0, 1], // sentence 1 — identical
    ]
    const result = rankSentences(query, vecs, 2)
    expect(result[0].index).toBe(1)
    expect(result[1].index).toBe(0)
  })

  it('when k is larger than the number of sentences, returns all sentences', () => {
    const query = [1, 0]
    const vecs = [[1, 0], [0, 1]]
    const result = rankSentences(query, vecs, 99)
    expect(result).toHaveLength(2)
  })

  it('when k is omitted, defaults to returning at most 5 results', () => {
    const query = [1, 0]
    const vecs = Array.from({ length: 8 }, () => [1, 0])
    const result = rankSentences(query, vecs)
    expect(result).toHaveLength(5)
  })
})

describe('embedSentences', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('POSTs to /api/embed with the correct model and input sentences', async () => {
    const fakeVec = [0.1, 0.2]
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { index: 0, embedding: fakeVec },
        ],
      }),
    } as Response)

    await embedSentences(['hello world'])

    expect(fetch).toHaveBeenCalledWith('/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: ['hello world'] }),
    })
  })

  it('returns vectors in the same order as the input sentences', async () => {
    // OpenAI may return data items out of order — sort by index before returning.
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { index: 1, embedding: [0, 1] },
          { index: 0, embedding: [1, 0] },
        ],
      }),
    } as Response)

    const result = await embedSentences(['first', 'second'])
    expect(result[0]).toEqual([1, 0])
    expect(result[1]).toEqual([0, 1])
  })

  it('throws when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
    } as Response)

    await expect(embedSentences(['hello'])).rejects.toThrow('embed failed: 401')
  })
})
