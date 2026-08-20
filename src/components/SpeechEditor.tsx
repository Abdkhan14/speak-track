import { useState } from 'react'
import styled from 'styled-components'

const MAX_SCRIPT_CHARS = 12000

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

export default function SpeechEditor() {
  const [text, setText] = useState('')

  return (
    <Wrapper>
      <TextArea
        placeholder="Paste your speech here…"
        value={text}
        maxLength={MAX_SCRIPT_CHARS}
        onChange={(e) => setText(e.target.value)}
      />
      <Count>
        {text.length} / {MAX_SCRIPT_CHARS.toLocaleString()}
      </Count>
    </Wrapper>
  )
}
