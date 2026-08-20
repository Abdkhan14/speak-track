// Minimal types for the Web Speech API — the DOM lib often omits these.
// We keep them here rather than installing @types packages.
export type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

export interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

export interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
}

type SpeechRecognitionWindow = {
  SpeechRecognition?: unknown
  webkitSpeechRecognition?: unknown
}

// Checks whether the browser exposes the Web Speech API.
// Chrome/Edge ship it under the webkit prefix; newer spec uses the unprefixed name.
// Returns false in Firefox (and any other browser without either name).
export function isSpeechRecognitionSupported(
  win: SpeechRecognitionWindow = window as unknown as SpeechRecognitionWindow,
): boolean {
  return (
    typeof win.SpeechRecognition !== 'undefined' ||
    typeof win.webkitSpeechRecognition !== 'undefined'
  )
}

// Returns the SpeechRecognition constructor available in this browser, or null.
// Prefers the unprefixed spec name; falls back to Chrome's webkit-prefixed name.
export function getSpeechRecognitionCtor(
  win: SpeechRecognitionWindow = window as unknown as SpeechRecognitionWindow,
): SpeechRecognitionConstructor | null {
  return (
    (win.SpeechRecognition as SpeechRecognitionConstructor | undefined) ??
    (win.webkitSpeechRecognition as SpeechRecognitionConstructor | undefined) ??
    null
  )
}

// Returns the last `max` whitespace-separated words from a transcript string.
// Used to keep the debug panel from growing unbounded as the user speaks.
export function lastHeardWords(transcript: string, max = 12): string {
  if (!transcript.trim()) return ''
  const words = transcript.trim().split(/\s+/)
  return words.slice(-max).join(' ')
}
