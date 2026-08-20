import { useEffect, useState } from 'react'
import { embedSentences } from '../lib/embeddings'

type EmbedQuery = {
  data: number[][] | null  // vectors once ready; null until success
  isLoading: boolean
  error: Error | null
}

// Fetches OpenAI embeddings for all sentences the moment they are provided.
// Returns { data, isLoading, error } so consumers stay free of fetch logic.
// Empty sentences array skips the API call entirely.
// A cancelled flag prevents state updates after the component unmounts or
// the sentences change (e.g. user goes back to edit and re-enters speaker mode).
export function useEmbedSentences(sentences: string[]): EmbedQuery {
  const [state, setState] = useState<EmbedQuery>({
    data: null,
    isLoading: false,
    error: null,
  })

  // Use a stable string key so a new array identity on every render does not
  // retrigger the effect — only a real content change should refetch.
  const sentencesKey = sentences.join('\0')

  useEffect(() => {
    if (sentences.length === 0) {
      setState({ data: [], isLoading: false, error: null })
      return
    }

    let cancelled = false
    setState({ data: null, isLoading: true, error: null })

    embedSentences(sentences).then(
      (vecs) => {
        if (!cancelled) setState({ data: vecs, isLoading: false, error: null })
      },
      (err: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            isLoading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          })
        }
      },
    )

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentencesKey])

  return state
}
