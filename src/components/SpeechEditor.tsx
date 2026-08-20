import { useState } from 'react'
import styled from 'styled-components'

interface SpeechEditorProps {
  onStartSpeaking: (text: string) => void
}

const MAX_SCRIPT_CHARS = 12000
const DRAFT_KEY = 'speak-track.draft'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 720px;
  flex: 1;
  min-height: 0;
`

const TextArea = styled.textarea`
  font-family: sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  resize: none;
  box-sizing: border-box;
`

const Count = styled.p`
  font-family: sans-serif;
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  text-align: right;
`

const StartButton = styled.button`
  align-self: flex-end;
  padding: 0.5rem 1.25rem;
  font-family: sans-serif;
  font-size: 0.875rem;
  cursor: pointer;
  background: #1a1a1a;
  color: #ffffff;
  border: none;
  border-radius: 4px;
`

function loadDraft(): string {
  const stored = localStorage.getItem(DRAFT_KEY) ?? ''
  return stored.slice(0, MAX_SCRIPT_CHARS)
}

export default function SpeechEditor({ onStartSpeaking }: SpeechEditorProps) {
  const [text, setText] = useState(loadDraft)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    setText(value)
    localStorage.setItem(DRAFT_KEY, value)
  }

  return (
    <Wrapper>
      <TextArea
        placeholder="Paste your speech here…"
        value={text}
        maxLength={MAX_SCRIPT_CHARS}
        onChange={handleChange}
      />
      <Count>
        {text.length} / {MAX_SCRIPT_CHARS.toLocaleString()}
      </Count>
      <StartButton onClick={() => onStartSpeaking(text)}>
        Start speaking
      </StartButton>
    </Wrapper>
  )
}
