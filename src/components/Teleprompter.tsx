import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { chunkSentences } from '../lib/chunkText'
import { embedSentences, rankSentences } from '../lib/embeddings'
import { useEmbedSentences } from '../hooks/useEmbedSentences'
import { tokenize, pickLine, overlapScore, sticky, WORD_FOLLOW_THRESHOLD, LOST_BEFORE_MEANING, MEANING_THRESHOLD } from '../lib/aligner'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { isSpeechRecognitionSupported, lastHeardWords } from '../lib/speechRecognition'
import DebugPanel from './DebugPanel'

interface TeleprompterProps {
  text: string
  onBack: () => void
}


const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-sizing: border-box;
`

const TopBar = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`

const TopBarButton = styled.button`
  padding: 0.4rem 0.875rem;
  font-family: sans-serif;
  font-size: 0.875rem;
  cursor: pointer;
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 4px;
`

const BackButton = TopBarButton

const PauseListeningButton = styled(TopBarButton)`
  color: #dc2626;
  border-color: #fca5a5;

  &:hover {
    background: #fef2f2;
  }
`

const ResumeListeningButton = styled(TopBarButton)`
  color: #16a34a;
  border-color: #86efac;

  &:hover {
    background: #f0fdf4;
  }
`

const TextBlock = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 3rem 1.5rem;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
`

const Sentence = styled.p<{ $active: boolean }>`
  font-family: sans-serif;
  font-size: 1.25rem;
  line-height: 1.8;
  color: #1a1a1a;
  margin: 0 0 1.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  background: ${(p) => (p.$active ? '#fef08a' : 'transparent')};
`

export default function Teleprompter({ text, onBack }: TeleprompterProps) {
  const sentences = chunkSentences(text)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchCursor, setMatchCursor] = useState(0)
  const [matches, setMatches] = useState<{ index: number; score: number }[]>([])
  const [findQuery, setFindQuery] = useState('')
  const [finding, setFinding] = useState(false)
  const activeRef = useRef<HTMLParagraphElement>(null)

  const { data: vecs, isLoading: embedLoading, error: embedError } = useEmbedSentences(sentences)

  const [paused, setPaused] = useState(false)
  const { lastHeard, mode } = useSpeechRecognition(isSpeechRecognitionSupported(), paused)
  const [followMode, setFollowMode] = useState<'idle' | 'words' | 'meaning'>('idle')
  const [lostCount, setLostCount] = useState(0)

  // Derive a single status string for the debug panel.
  const embedStatus = embedLoading
    ? 'Embedding...'
    : embedError
      ? `Error: ${embedError.message}`
      : `Ready (${(vecs ?? []).length} vectors)`

  // Scroll the highlighted sentence into the center of the scroller
  // whenever currentIndex changes, including on first entry (index 0).
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [currentIndex])

  // Jump to a match by cursor position. Clamps the sentence index so a
  // short script cannot point past the last sentence.
  function jumpToMatch(cursor: number) {
    const match = matches[cursor]
    setMatchCursor(cursor)
    setCurrentIndex(Math.min(match.index, sentences.length - 1))
  }

  function handlePrev() {
    if (matches.length === 0) return
    const next = (matchCursor - 1 + matches.length) % matches.length
    jumpToMatch(next)
  }

  function handleNext() {
    if (matches.length === 0) return
    const next = (matchCursor + 1) % matches.length
    jumpToMatch(next)
  }

  // Simulate next increments the sentence linearly — does not affect matchCursor.
  function handleSimulateNext() {
    setCurrentIndex((i) => Math.min(i + 1, sentences.length - 1))
  }

  // Tries word overlap first. If the best score in the cursor window meets the
  // threshold, jumps immediately with no API call (mode: words). Otherwise falls
  // back to embedding + cosine rank (mode: meaning). setFinding only gates the
  // embed branch so a verbatim match never flashes "Finding...".
  async function handleFind() {
    if (finding || !findQuery.trim()) return

    const heard = tokenize(findQuery)
    const lexical = pickLine(heard, sentences, currentIndex)
    const currentScore = overlapScore(heard, sentences[currentIndex])
    const nextIndex = sticky(currentIndex, lexical, currentScore)

    if (lexical.score >= WORD_FOLLOW_THRESHOLD) {
      setLostCount(0)
      setMatches([{ index: nextIndex, score: lexical.score }])
      setMatchCursor(0)
      setCurrentIndex(nextIndex)
      setFollowMode('words')
      return
    }

    const nextLost = lostCount + 1
    setLostCount(nextLost)

    // Accumulate weak results silently until the threshold is reached.
    // Avoids an API call on every slightly-misheard phrase.
    if (nextLost < LOST_BEFORE_MEANING) return

    if (!vecs) return
    setFinding(true)
    try {
      // Trim to 15 words so the embedding is proportional to what was just said.
      const trimmed = lastHeardWords(findQuery)
      const [queryVec] = await embedSentences([trimmed])
      const ranked = rankSentences(queryVec, vecs)
      // Always reset so subsequent weak Finds don't pile up after the attempt.
      setLostCount(0)
      setMatches(ranked)
      setMatchCursor(0)
      if (ranked[0].score >= MEANING_THRESHOLD) {
        setCurrentIndex(ranked[0].index)
        setFollowMode('meaning')
      }
      // Below threshold: keep cursor, but still populate matches so Prev/Next
      // shows the top guesses in the debug panel for inspection.
    } finally {
      setFinding(false)
    }
  }

  return (
    <Overlay>
      <TopBar>
        <BackButton onClick={onBack}>← Back to edit</BackButton>
        {mode !== 'idle' && (
          paused
            ? <ResumeListeningButton onClick={() => setPaused(false)}>Resume Listening</ResumeListeningButton>
            : <PauseListeningButton onClick={() => setPaused(true)}>Pause Listening</PauseListeningButton>
        )}
      </TopBar>
      <TextBlock>
        {sentences.map((sentence, index) => (
          <Sentence
            key={index}
            ref={index === currentIndex ? activeRef : null}
            $active={index === currentIndex}
            onClick={() => setCurrentIndex(index)}
          >
            {sentence}
          </Sentence>
        ))}
      </TextBlock>
      <DebugPanel
        currentIndex={currentIndex}
        lastHeard={lastHeard}
        matches={matches}
        matchCursor={matchCursor}
        mode={followMode}
        embedStatus={embedStatus}
        findQuery={findQuery}
        onFindChange={setFindQuery}
        onFind={handleFind}
        finding={finding}
        onPrev={handlePrev}
        onNext={handleNext}
        onSimulateNext={handleSimulateNext}
        lostCount={lostCount}
      />
    </Overlay>
  )
}
