import { useState } from 'react'
import styled from 'styled-components'
import SpeechEditor from './components/SpeechEditor'
import Teleprompter from './components/Teleprompter'

type Mode = 'edit' | 'speaker'

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.5rem;
  height: 100vh;
  background: #ffffff;
  box-sizing: border-box;
`

const Title = styled.h1`
  font-family: sans-serif;
  font-size: 2.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1.5rem;
`

export default function App() {
  const [mode, setMode] = useState<Mode>('edit')
  const [speakerText, setSpeakerText] = useState('')

  function handleStartSpeaking(text: string) {
    setSpeakerText(text)
    setMode('speaker')
  }

  function handleBack() {
    setMode('edit')
  }

  if (mode === 'speaker') {
    return <Teleprompter text={speakerText} onBack={handleBack} />
  }

  return (
    <Page>
      <Title>Speak Track</Title>
      <SpeechEditor onStartSpeaking={handleStartSpeaking} />
    </Page>
  )
}
