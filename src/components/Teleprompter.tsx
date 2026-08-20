import styled from 'styled-components'

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
  font-family: sans-serif;
  font-size: 1.25rem;
  line-height: 1.8;
  color: #1a1a1a;
  white-space: pre-wrap;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
`

export default function Teleprompter({ text, onBack }: TeleprompterProps) {
  return (
    <Overlay>
      <TopBar>
        <BackButton onClick={onBack}>← Back to edit</BackButton>
      </TopBar>
      <TextBlock>{text}</TextBlock>
    </Overlay>
  )
}
