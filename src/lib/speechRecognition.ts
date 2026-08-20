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
