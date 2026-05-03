'use client'
import { useState, useCallback, useRef } from 'react'

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isListeningRef = useRef(false)
  const finalTranscriptRef = useRef('')

  const isSupported = typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  )

  const startListening = useCallback(() => {
    if (!isSupported || isListeningRef.current) return

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'zh-CN'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript
        } else {
          interim += event.results[i][0].transcript
        }
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      isListeningRef.current = false
    }

    recognition.onerror = () => {
      setIsListening(false)
      isListeningRef.current = false
    }

    recognitionRef.current = recognition
    finalTranscriptRef.current = ''
    recognition.start()
    setIsListening(true)
    isListeningRef.current = true
  }, [isSupported])

  const stopListening = useCallback((): string => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    setIsListening(false)
    isListeningRef.current = false
    const result = finalTranscriptRef.current
    finalTranscriptRef.current = ''
    return result
  }, [])

  const toggleListening = useCallback((): string => {
    if (isListeningRef.current) {
      return stopListening()
    } else {
      startListening()
      return ''
    }
  }, [startListening, stopListening])

  return { isListening, isSupported, startListening, stopListening, toggleListening }
}
