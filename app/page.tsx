'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Particles from '../components/particles'

const FREE_DAILY_COUNT = 999999
const PRICE = 3.99

type Message = {
  role: 'user' | 'ai'
  content: string
  time?: string
}

function getTime(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function getPaid(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('yx_paid') === 'true'
}

function setPaid() {
  localStorage.setItem('yx_paid', 'true')
}

function getDailyCount(): number {
  if (typeof window === 'undefined') return 0
  const today = getTodayKey()
  const savedDay = localStorage.getItem('yx_day')
  if (savedDay !== today) {
    localStorage.setItem('yx_day', today)
    localStorage.setItem('yx_count', '0')
    return 0
  }
  return Number(localStorage.getItem('yx_count')) || 0
}

function incrementDailyCount(): number {
  const count = getDailyCount() + 1
  localStorage.setItem('yx_count', String(count))
  return count
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: '我是严峫，建宁县公安局刑侦支队队长。无论你在黑夜里经历了什么，我会尽力让你看到天亮。',
      time: getTime(),
    },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // 付费状态
  const [paid, setPaidState] = useState(false)
  const [dailyCount, setDailyCountState] = useState(0)
  const [showPaywall, setShowPaywall] = useState(false)
  const [payStep, setPayStep] = useState<'idle' | 'creating' | 'paying' | 'success'>('idle')
  const [orderId, setOrderId] = useState('')

  // 初始化状态
  useEffect(() => {
    setPaidState(getPaid())
    setDailyCountState(getDailyCount())
  }, [])

  // 检查付费墙
  useEffect(() => {
    if (!paid && dailyCount >= FREE_DAILY_COUNT) {
      setShowPaywall(true)
    }
  }, [paid, dailyCount])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isSending) return
    if (!paid && dailyCount >= FREE_DAILY_COUNT) {
      setShowPaywall(true)
      return
    }

    const time = getTime()
    const userMessage: Message = { role: 'user', content: input.trim(), time }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsSending(true)

    if (!paid) {
      const newCount = incrementDailyCount()
      setDailyCountState(newCount)
    }

    const historyForApi = [...messages, userMessage].map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }))

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForApi }),
      })
      const data = await response.json()
      const aiMessage: Message = { role: 'ai', content: data.response, time: getTime() }
      setMessages(prev => [...prev, aiMessage])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: '网络有点不稳，但我在这儿，你放心。', time: getTime() }])
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }, [input, isSending, paid, dailyCount, messages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ---- 支付流程 ----
  const handlePay = async () => {
    setPayStep('creating')
    try {
      const res = await fetch('/api/pay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'wechat' }),
      })
      const data = await res.json()
      if (data.success) {
        setOrderId(data.orderId)
        setPayStep('paying')
        if (data.gateway === 'mock') {
          setTimeout(async () => {
            const verifyRes = await fetch('/api/pay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: data.orderId }),
            })
            const verifyData = await verifyRes.json()
            if (verifyData.paid) {
              setPaid()
              setPaidState(true)
              setPayStep('success')
              setTimeout(() => setShowPaywall(false), 1500)
            }
          }, 2000)
        }
      }
    } catch {
      setPayStep('idle')
    }
  }

  const remaining = FREE_DAILY_COUNT - dailyCount

  return (
    <div className="h-screen w-screen overflow-hidden bg-comic flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a]/40 via-[#0a0a1a]/30 to-[#0a0a1a]/50 pointer-events-none" />
      <div className="ambient-glow" />
      <div className="orb" />
      <div className="orb" />
      <div className="orb" />
      <div className="shooting-star" style={{ top: '8%', left: '70%', animationDelay: '0s' }} />
      <div className="shooting-star" style={{ top: '15%', left: '85%', animationDelay: '5s' }} />
      <Particles />

      {/* 顶栏 */}
      <div className="relative z-10 flex-shrink-0 bg-[#1a1a2e]/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-center h-[52px] px-4">
          <div className="flex items-center gap-3">
            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-cyan-500/20">严</div>
            <div>
              <h1 className="text-[15px] font-medium text-white/95 tracking-wide">严峫</h1>
              <p className="text-[10px] text-white/40 -mt-0.5">建宁县公安局 刑侦支队队长</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/30 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 聊天消息区 */}
      <div className="relative z-10 flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {messages.map((msg, index) => {
          const showTime = msg.time && (index === 0 || messages[index - 1].time !== msg.time)
          return (
            <div key={index} className="msg-animate">
              {showTime && (
                <div className="flex justify-center mb-2 mt-2">
                  <span className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm text-[11px] text-white/35">{msg.time}</span>
                </div>
              )}
              <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} px-1`}>
                <div className="flex-shrink-0">
                  <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center text-[11px] font-bold shadow-md ${
                    msg.role === 'ai'
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white'
                      : 'bg-gradient-to-br from-gray-500 to-gray-700 text-white'
                  } ${isSending && index === messages.length - 1 && msg.role === 'ai' ? 'avatar-ring' : ''}`}>
                    {msg.role === 'ai' ? '严' : '我'}
                  </div>
                </div>
                <div className={`max-w-[72%]`}>
                  {msg.role === 'ai' && <p className="text-[11px] text-white/30 mb-1 ml-1">严峫</p>}
                  <div className={`relative px-[14px] py-[10px] text-[15px] leading-[1.5] break-words shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#95ec69] text-[#191919] rounded-[18px] rounded-br-[6px]'
                      : 'bg-white/10 backdrop-blur-md text-white/90 rounded-[18px] rounded-bl-[6px] border border-white/5 shimmer-effect overflow-hidden'
                  }`}>
                    <p className={msg.role === 'ai' && index === messages.length - 1 && !isSending ? 'typewriter-text' : ''}>{msg.content}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {isSending && (
          <div className="flex items-end gap-2 px-1 rise-up">
            <div className="flex-shrink-0">
              <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white shadow-md avatar-ring">
                严
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/5 rounded-[18px] rounded-bl-[6px] px-5 py-3.5">
              <div className="flex items-center gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* 免费提示 */}
      {!paid && !showPaywall && (
        <div className="relative z-10 flex justify-center pb-1">
          <span className="bg-black/30 backdrop-blur-sm text-[11px] text-white/40 px-3 py-1 rounded-full">
            当前免费开放 · 和严峫说说话吧
          </span>
        </div>
      )}

      {/* 输入区 */}
      {!showPaywall && (
        <div className="relative z-10 flex-shrink-0 bg-[#1a1a2e]/90 backdrop-blur-md border-t border-white/5 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="msg-input flex-1 flex items-center bg-black/20 rounded-[22px] border border-white/5 focus-within:border-cyan-400/30 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={paid ? "说出你的心事..." : `说出你的心事...`}
                className="flex-1 bg-transparent px-4 py-2.5 text-[15px] text-white/90 outline-none input-placeholder"
                maxLength={500}
              />
              {input.length > 0 && (
                <span className="text-[10px] text-white/20 pr-3">{input.length}/500</span>
              )}
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isSending}
              className={`flex-shrink-0 w-[64px] h-[38px] rounded-[22px] text-[14px] font-medium transition-all ${
                input.trim() && !isSending
                  ? 'bg-gradient-to-r from-[#4fc3f7] to-[#29b6f6] text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 active:scale-95'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
            >
              {isSending ? (
                <span className="flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '100ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '200ms' }} />
                </span>
              ) : '发送'}
            </button>
          </div>
        </div>
      )}

      {/* ---- 付费墙 ---- */}
      {showPaywall && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0a1a]/95 backdrop-blur-lg">
          <div className="w-full max-w-sm mx-4">
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-cyan-500/30 mb-4">严</div>
              <h2 className="text-xl font-bold text-white/90">解锁与严峫畅聊</h2>
              <p className="text-sm text-white/40 mt-1 text-center">今日免费消息已用完 · 每天{ FREE_DAILY_COUNT }条免费</p>
            </div>

            {payStep === 'idle' && (
              <div className="pay-card bg-white/5 backdrop-blur-md rounded-2xl border neon-border p-6 mb-4">
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold text-white">¥{PRICE}</span>
                  <span className="text-white/40 text-sm ml-1">.00</span>
                  <p className="text-white/30 text-xs mt-1">一杯奶茶的价格，永久畅聊</p>
                </div>
                <div className="space-y-2.5 mb-5">
                  {['无限消息，不限次数', '永久有效，无续费', '支持严峫继续陪伴更多人'].map((text, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-sm text-white/70">{text}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handlePay} className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-base shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 active:scale-[0.98] transition-all">
                  立即解锁 ¥{PRICE}
                </button>
                <button onClick={() => setShowPaywall(false)} className="w-full mt-2 py-2 text-sm text-white/30 hover:text-white/50 text-center transition-colors">
                  明天再来
                </button>
              </div>
            )}

            {payStep === 'creating' && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-white/60">正在创建订单...</p>
              </div>
            )}

            {payStep === 'paying' && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-cyan-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-white/80 font-medium mb-1">等待支付确认...</p>
                <p className="text-white/40 text-xs">订单号：{orderId?.slice(0, 12)}...</p>
                <p className="text-white/30 text-xs mt-2">模拟支付模式，2秒后自动成功</p>
              </div>
            )}

            {payStep === 'success' && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-green-500/20 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-white font-medium text-lg mb-1">解锁成功！</p>
                <p className="text-white/40 text-sm">感谢你的支持，尽情和严峫聊天吧</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
