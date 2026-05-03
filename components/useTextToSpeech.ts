'use client'
import { useState, useCallback, useRef, useEffect } from 'react'

export function useTextToSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const [speakingId, setSpeakingId] = useState<number | null>(null)
  const [voicesReady, setVoicesReady] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isSpeakingRef = useRef(false)

  // 等待语音列表加载
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const check = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) setVoicesReady(true)
    }
    window.speechSynthesis.addEventListener('voiceschanged', check)
    check() // 立即检查
    return () => window.speechSynthesis.removeEventListener('voiceschanged', check)
  }, [])

  const getBestVoice = () => {
    const voices = window.speechSynthesis.getVoices()

    // 优先 Windows 11 自然男声 (最佳效果)
    const preferredMale = [
      'Microsoft Yunjian',   // 云健 - 自然中文男声
      'Microsoft Yunxi',     // 云希 - 自然中文男声
      'Microsoft Kangkang',  // 康康 - 中文男声
      'Microsoft Zhiming',   // 志明 - 中文男声
    ]
    for (const name of preferredMale) {
      const found = voices.find(v => v.name.includes(name))
      if (found) return found
    }

    // 其次任何中文男声
    const zhMale = voices.find(
      v => v.lang.startsWith('zh') && (v.name.includes('Male') || v.name.includes('男性') || v.name.toLowerCase().includes('yun') || v.name.toLowerCase().includes('kang'))
    )
    if (zhMale) return zhMale

    // 最后任何中文语音
    return voices.find(v => v.lang.startsWith('zh')) || null
  }

  const speak = useCallback((text: string, id?: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    // 停止正在播放的
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.92      // 偏慢，小说朗读感的语速
    utterance.pitch = 0.65     // 更低沉，磁性男声
    utterance.volume = 1.0

    const voice = getBestVoice()
    if (voice) {
      utterance.voice = voice
      // Windows 自然语音用更低的 rate 效果更好
      if (voice.name.includes('Yunjian') || voice.name.includes('Yunxi')) {
        utterance.rate = 0.88
      }
    }

    utterance.onstart = () => {
      setSpeaking(true)
      setSpeakingId(id ?? null)
      isSpeakingRef.current = true
    }

    utterance.onend = () => {
      setSpeaking(false)
      setSpeakingId(null)
      isSpeakingRef.current = false
    }

    utterance.onerror = () => {
      setSpeaking(false)
      setSpeakingId(null)
      isSpeakingRef.current = false
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)
    setSpeakingId(null)
    isSpeakingRef.current = false
  }, [])

  const toggle = useCallback((text: string, id?: number) => {
    if (isSpeakingRef.current && speakingId === id) {
      stop()
    } else {
      speak(text, id)
    }
  }, [speak, stop, speakingId])

  return { speaking, speakingId, speak, stop, toggle, voicesReady }
}
