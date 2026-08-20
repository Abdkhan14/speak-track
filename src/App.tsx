import styled from 'styled-components'
import SpeechEditor from './components/SpeechEditor'

const Title = styled.h1`
  font-family: sans-serif;
  font-size: 2.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1.5rem;
`

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.5rem;
  height: 100vh;
  background: #ffffff;
  box-sizing: border-box;
`

export default function App() {
  return (
    <Page>
      <Title>Speak Track</Title>
      <SpeechEditor />
    </Page>
  )
}
