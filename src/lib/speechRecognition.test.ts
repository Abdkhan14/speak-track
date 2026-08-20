import { describe, it, expect } from 'vitest'
import { isSpeechRecognitionSupported, getSpeechRecognitionCtor, lastHeardWords } from './speechRecognition'

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

describe('getSpeechRecognitionCtor', () => {
  it('when window has neither API, returns null', () => {
    expect(getSpeechRecognitionCtor({})).toBeNull()
  })

  it('when window has unprefixed SpeechRecognition, returns it', () => {
    const ctor = function FakeSpeech() {}
    expect(getSpeechRecognitionCtor({ SpeechRecognition: ctor })).toBe(ctor)
  })

  it('when window has only webkitSpeechRecognition, returns it', () => {
    const ctor = function FakeWebkitSpeech() {}
    expect(getSpeechRecognitionCtor({ webkitSpeechRecognition: ctor })).toBe(ctor)
  })

  it('when window has both, unprefixed takes priority', () => {
    const unprefixed = function Unprefixed() {}
    const webkit = function Webkit() {}
    expect(getSpeechRecognitionCtor({ SpeechRecognition: unprefixed, webkitSpeechRecognition: webkit })).toBe(unprefixed)
  })
})

describe('lastHeardWords', () => {
  it('when transcript is empty, returns empty string', () => {
    expect(lastHeardWords('')).toBe('')
  })

  it('when transcript has fewer words than max, returns the full transcript', () => {
    expect(lastHeardWords('hello world', 15)).toBe('hello world')
  })

  it('when transcript exceeds max, returns the last max words', () => {
    expect(lastHeardWords('one two three four five', 3)).toBe('three four five')
  })

  it('when max is 1, returns only the last word', () => {
    expect(lastHeardWords('alpha beta gamma', 1)).toBe('gamma')
  })

  it('defaults to 12 words when max is omitted', () => {
    const words = Array.from({ length: 20 }, (_, i) => `w${i}`).join(' ')
    const result = lastHeardWords(words)
    expect(result.split(' ')).toHaveLength(12)
  })
})
