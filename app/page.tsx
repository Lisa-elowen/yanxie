'use client'

import { useEffect, useRef, useState } from 'react'

type Message = {
  role: 'user' | 'ai'
  content: string
  time?: string
}

function getTime(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
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
  const [showTimestamp, setShowTimestamp] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 自动聚焦输入框
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || isSending) return

    const time = getTime()
    const userMessage: Message = { role: 'user', content: input.trim(), time }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsSending(true)

    // 准备对话历史给API
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
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-comic flex flex-col">
      {/* 半透明叠加层营造朦胧漫画感 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a]/60 via-[#0a0a1a]/40 to-[#0a0a1a]/70 pointer-events-none" />

      {/* 微信风格顶栏 */}
      <div className="relative z-10 flex-shrink-0 bg-[#1a1a2e]/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-center h-[52px] px-4">
          <div className="flex items-center gap-3">
            {/* 严峫头像 */}
            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-cyan-500/20">
              严
            </div>
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
              {/* 时间戳 */}
              {showTime && (
                <div className="timestamp flex justify-center mb-2 mt-2">
                  <span className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm text-[11px] text-white/35">
                    {msg.time}
                  </span>
                </div>
              )}

              <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} px-1`}>
                {/* 头像 */}
                <div className={`flex-shrink-0 ${msg.role === 'user' ? 'ml-0' : 'mr-0'}`}>
                  {msg.role === 'ai' ? (
                    <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-[11px] font-bold shadow-md">
                      严
                    </div>
                  ) : (
                    <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white text-[11px] font-bold shadow-md">
                      我
                    </div>
                  )}
                </div>

                {/* 气泡 */}
                <div className={`max-w-[72%] ${msg.role === 'user' ? 'mr-0' : 'ml-0'}`}>
                  {msg.role === 'ai' && (
                    <p className="text-[11px] text-white/30 mb-1 ml-1">严峫</p>
                  )}
                  <div
                    className={`relative px-[14px] py-[10px] text-[15px] leading-[1.5] break-words shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#95ec69] text-[#191919] rounded-[18px] rounded-br-[6px]'
                        : 'bg-white/10 backdrop-blur-md text-white/90 rounded-[18px] rounded-bl-[6px] border border-white/5'
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* 微信风格输入区 */}
      <div className="relative z-10 flex-shrink-0 bg-[#1a1a2e]/90 backdrop-blur-md border-t border-white/5 px-3 py-2.5 safe-area-bottom">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-black/20 rounded-[22px] border border-white/5 focus-within:border-cyan-400/30 transition-all duration-300">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="说出你的心事..."
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
            className={`flex-shrink-0 w-[64px] h-[38px] rounded-[22px] text-[14px] font-medium transition-all duration-200 ${
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
            ) : (
              '发送'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
