import styled from 'styled-components'
import { isSpeechRecognitionSupported } from '../lib/speechRecognition'

const Banner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fef2f2;
  border-bottom: 1px solid #fca5a5;
  padding: 0.6rem 1.25rem;
  font-family: sans-serif;
  font-size: 0.875rem;
  color: #991b1b;
  text-align: center;
`

// Renders a banner when the browser does not support the Web Speech API.
// Returns null on Chrome/Edge so the rest of the UI is unaffected.
export default function MicSupportBanner() {
  if (isSpeechRecognitionSupported()) return null
  return (
    <Banner>
      Microphone not supported in this browser. Use Chrome or Edge.
    </Banner>
  )
}
