import { useEffect, useRef, useState } from 'react'
import {
  getSpeechRecognitionCtor,
  lastHeardWords,
  type SpeechRecognitionInstance,
} from '../lib/speechRecognition'

type SpeechRecognitionState = {
  lastHeard: string
  mode: 'idle' | 'listening'
}

// Starts Web Speech Recognition when `enabled` is true (Chrome/Edge only).
// Returns the last ~15 spoken words and the current mode for the debug panel.
// When `enabled` is false (Firefox / unsupported) the hook is a no-op — it never
// constructs the object or prompts for permission.
// Cleanup on unmount or `enabled` flip calls stop() and drops all handlers so
// the browser mic indicator disappears when the user returns to the edit screen.
// Auto-restart on onend is intentionally deferred to PR 19.
export function useSpeechRecognition(enabled: boolean): SpeechRecognitionState {
  const [state, setState] = useState<SpeechRecognitionState>({
    lastHeard: '',
    mode: 'idle',
  })
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    if (!enabled) {
      setState({ lastHeard: '', mode: 'idle' })
      return
    }

    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      setState({ lastHeard: '', mode: 'idle' })
      return
    }

    const recognition = new Ctor()
    recognitionRef.current = recognition

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    // Build a full utterance from all results in this session, then trim to
    // the last 15 words so the debug panel stays readable.
    recognition.onresult = (event) => {
      let utterance = ''
      for (let i = 0; i < event.results.length; i++) {
        utterance += event.results[i][0].transcript
      }
      setState((prev) => ({ ...prev, lastHeard: lastHeardWords(utterance) }))
    }

    recognition.onerror = () => {
      // Permission denied or other error — stay idle, no new UI this PR.
      setState({ lastHeard: '', mode: 'idle' })
    }

    try {
      recognition.start()
      setState((prev) => ({ ...prev, mode: 'listening' }))
    } catch {
      setState({ lastHeard: '', mode: 'idle' })
    }

    return () => {
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      try { recognition.stop() } catch { /* already stopped */ }
      recognitionRef.current = null
    }
  }, [enabled])

  return state
}
