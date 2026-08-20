import { useEffect, useRef, useState } from 'react'
import {
  getSpeechRecognitionCtor,
  lastHeardWords,
  type SpeechRecognitionInstance,
} from '../lib/speechRecognition'

type SpeechRecognitionState = {
  lastHeard: string
  mode: 'idle' | 'listening' | 'paused'
}

// Starts Web Speech Recognition when `enabled` is true (Chrome/Edge only).
// Returns the last ~15 spoken words and the current mode for the debug panel.
// When `enabled` is false (Firefox / unsupported) the hook is a no-op.
// `paused` stops recognition without destroying the instance; resume restarts it.
// Auto-restarts on Chrome's silent onend while not paused (deferred from PR 18).
export function useSpeechRecognition(
  enabled: boolean,
  paused: boolean,
): SpeechRecognitionState {
  const [state, setState] = useState<SpeechRecognitionState>({
    lastHeard: '',
    mode: 'idle',
  })
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  // Keep a ref in sync so the onend closure always reads the current value
  // without needing to be re-attached (avoids rebuilding the recognizer on every pause flip).
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  // Effect 1 — construct / start / cleanup.
  // paused is intentionally excluded from deps: pause/resume is handled in Effect 2
  // so we never destroy and recreate the recognizer just to flip a flag.
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

    recognition.onresult = (event) => {
      // Chrome can fire one last onresult after stop() is called.
      // Discard it so the follow loop does not move the highlight while paused.
      if (pausedRef.current) return
      let utterance = ''
      for (let i = 0; i < event.results.length; i++) {
        utterance += event.results[i][0].transcript
      }
      setState((prev) => ({ ...prev, lastHeard: lastHeardWords(utterance) }))
    }

    recognition.onerror = () => {
      setState({ lastHeard: '', mode: 'idle' })
    }

    // Chrome fires onend silently after a quiet stretch and never restarts.
    // Restart only when not paused — pausing calls stop() which also fires onend,
    // and restarting there would undo the pause.
    recognition.onend = () => {
      if (pausedRef.current || !recognitionRef.current) return
      try { recognitionRef.current.start() } catch { /* already started */ }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  // Effect 2 — stop/start on pause flip.
  // Does not touch the recognizer instance, only calls stop() or start() on it.
  // On first mount paused is false and Effect 1 already called start(), so the
  // resume branch here is a no-op (start() throws "already started", caught silently).
  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return
    if (paused) {
      try { recognition.stop() } catch { /* already stopped */ }
      setState((prev) => ({ ...prev, mode: 'paused' }))
      return
    }
    try { recognition.start() } catch { /* already running */ }
    setState((prev) => ({ ...prev, mode: 'listening' }))
  }, [paused])

  return state
}
