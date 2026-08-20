import styled from 'styled-components'

const Title = styled.h1`
  font-family: sans-serif;
  font-size: 2.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`

const Page = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #ffffff;
`

export default function App() {
  return (
    <Page>
      <Title>Speak Track</Title>
    </Page>
  )
}
