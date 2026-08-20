import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { chunkSentences } from '../lib/chunkText'
import DebugPanel from './DebugPanel'

interface TeleprompterProps {
  text: string
  onBack: () => void
}

// Hardcoded ranked match list — replaced by real embeddings in a later PR.
const FAKE_MATCHES = [
  { index: 0, score: 0.91 },
  { index: 4, score: 0.55 },
  { index: 8, score: 0.48 },
  { index: 12, score: 0.42 },
]

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
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`

const BackButton = styled.button`
  padding: 0.4rem 0.875rem;
  font-family: sans-serif;
  font-size: 0.875rem;
  cursor: pointer;
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 4px;
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
  const activeRef = useRef<HTMLParagraphElement>(null)

  // Scroll the highlighted sentence into the center of the scroller
  // whenever currentIndex changes, including on first entry (index 0).
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [currentIndex])

  // Jump to a match by cursor position. Clamps the sentence index so a
  // short script cannot point past the last sentence.
  function jumpToMatch(cursor: number) {
    const match = FAKE_MATCHES[cursor]
    setMatchCursor(cursor)
    setCurrentIndex(Math.min(match.index, sentences.length - 1))
  }

  function handlePrev() {
    const next = (matchCursor - 1 + FAKE_MATCHES.length) % FAKE_MATCHES.length
    jumpToMatch(next)
  }

  function handleNext() {
    const next = (matchCursor + 1) % FAKE_MATCHES.length
    jumpToMatch(next)
  }

  // Simulate next increments the sentence linearly — does not affect matchCursor.
  function handleSimulateNext() {
    setCurrentIndex((i) => Math.min(i + 1, sentences.length - 1))
  }

  return (
    <Overlay>
      <TopBar>
        <BackButton onClick={onBack}>← Back to edit</BackButton>
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
        lastHeard=""
        matches={FAKE_MATCHES}
        matchCursor={matchCursor}
        mode="idle"
        onPrev={handlePrev}
        onNext={handleNext}
        onSimulateNext={handleSimulateNext}
      />
    </Overlay>
  )
}
