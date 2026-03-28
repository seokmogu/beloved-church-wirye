'use client'

import { MessageCircle, X, Send } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function ChatWidget(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Cancel on unmount
  useEffect(() => () => { abortRef.current?.abort() }, [])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  // Escape key to close panel
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isOpen])

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleClose = (): void => {
    abortRef.current?.abort()
    setIsOpen(false)
  }

  const sendMessage = async (): Promise<void> => {
    const userMessage = input.trim()
    if (!userMessage || isLoading || isStreaming) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    if (process.env.NEXT_PUBLIC_CHAT_ENABLED === 'false') {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '채팅 서비스 준비 중입니다' },
      ])
      setIsLoading(false)
      setTimeout(scrollToBottom, 50)
      return
    }

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      // Proxy through Next.js route handler to keep upstream URL private
      // A route handler at /api/chat-proxy should forward to the upstream service
      const response = await fetch('/api/chat-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, stream: true }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response body')

      setIsLoading(false)
      setIsStreaming(true)

      // Chunk-safe SSE parsing with buffer
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? '' // keep incomplete last line
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue
          if (trimmed.startsWith('data: ')) {
            const text = trimmed.slice(6)
            if (text === '[DONE]') { reader.cancel(); break }
            setMessages((prev) => {
              const updated = [...prev]
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: updated[updated.length - 1].content + text,
              }
              return updated
            })
          }
        }
        setTimeout(scrollToBottom, 50)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Stream was aborted intentionally; do not show error
      } else {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
          }
          return updated
        })
      }
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }

    setTimeout(scrollToBottom, 50)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  const isBusy = isLoading || isStreaming

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '24px',
            width: 'min(350px, calc(100vw - 24px))',
            height: 'min(500px, calc(100vh - 80px))',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            animation: 'slideUp 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#1B3A2D',
              color: 'white',
              padding: '16px',
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '15px' }}>교회 AI 도우미</span>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="닫기"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages area */}
          <div
            role="log"
            aria-live="polite"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.length === 0 && (
              <p
                style={{
                  textAlign: 'center',
                  color: '#9CA3AF',
                  fontSize: '14px',
                  marginTop: '32px',
                }}
              >
                무엇이든 물어보세요
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: '18px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    backgroundColor: msg.role === 'user' ? '#1B3A2D' : '#F3F4F6',
                    color: msg.role === 'user' ? 'white' : '#1F2937',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    backgroundColor: '#F3F4F6',
                    borderRadius: '18px',
                    padding: '12px 16px',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#9CA3AF',
                        display: 'inline-block',
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div
            style={{
              borderTop: '1px solid #E5E7EB',
              padding: '12px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="메시지 입력"
              placeholder="궁금한 것을 물어보세요..."
              disabled={isBusy}
              style={{
                flex: 1,
                border: '1px solid #E5E7EB',
                borderRadius: '20px',
                padding: '8px 14px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: isBusy ? '#F9FAFB' : 'white',
              }}
            />
            <button
              onClick={() => void sendMessage()}
              disabled={isBusy || !input.trim()}
              aria-label="전송"
              style={{
                backgroundColor: '#C9A84C',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isBusy || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: isBusy || !input.trim() ? 0.5 : 1,
                flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? '채팅 닫기' : '채팅 열기'}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#1B3A2D',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
          zIndex: 10000,
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  )
}
