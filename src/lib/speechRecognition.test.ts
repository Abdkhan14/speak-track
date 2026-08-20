import { describe, it, expect } from 'vitest'
import { isSpeechRecognitionSupported } from './speechRecognition'

describe('isSpeechRecognitionSupported', () => {
  it('when neither SpeechRecognition nor webkitSpeechRecognition exist, returns false', () => {
    expect(isSpeechRecognitionSupported({})).toBe(false)
  })

  it('when SpeechRecognition is present, returns true', () => {
    expect(isSpeechRecognitionSupported({ SpeechRecognition: function () {} })).toBe(true)
  })

  it('when only webkitSpeechRecognition is present (Chrome), returns true', () => {
    expect(isSpeechRecognitionSupported({ webkitSpeechRecognition: function () {} })).toBe(true)
  })

  it('when both are present, returns true', () => {
    expect(
      isSpeechRecognitionSupported({
        SpeechRecognition: function () {},
        webkitSpeechRecognition: function () {},
      }),
    ).toBe(true)
  })
})
