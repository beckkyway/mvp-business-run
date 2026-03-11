import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Message } from '../../store'
import { exportToExcel, copyToClipboard } from '../../lib/exportUtils'

interface ChatWindowProps {
  messages: Message[]
  isLoading: boolean
  agentName: string
}

function AssistantActions({ content, agentName }: { content: string; agentName: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
      <button
        onClick={handleCopy}
        style={{
          padding: '5px 12px',
          background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '6px',
          color: copied ? '#4ade80' : '#64748b',
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {copied ? '✓ Скопировано' : '📋 Копировать'}
      </button>
      <button
        onClick={() => exportToExcel(content, agentName)}
        style={{
          padding: '5px 12px',
          background: 'rgba(124,58,237,0.1)',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: '6px',
          color: '#a78bfa',
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        📥 Скачать Excel
      </button>
    </div>
  )
}

export function ChatWindow({ messages, isLoading, agentName }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0 && !isLoading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#475569',
          fontSize: '14px',
        }}
      >
        Загрузите файл или введите данные, чтобы начать анализ
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}
        >
          {msg.role === 'user' ? (
            <div
              style={{
                background: 'rgba(124, 58, 237, 0.2)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                borderRadius: '12px 12px 4px 12px',
                padding: '10px 14px',
                maxWidth: '70%',
                fontSize: '14px',
                color: '#e2e8f0',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.content}
            </div>
          ) : (
            <>
              <div
                className="markdown-body"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '4px 12px 12px 12px',
                  padding: '16px 20px',
                  maxWidth: '100%',
                  fontSize: '14px',
                }}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              {!isLoading && msg.content && (
                <AssistantActions content={msg.content} agentName={agentName} />
              )}
            </>
          )}
          <div style={{ fontSize: '11px', color: '#334155', marginTop: '4px' }}>
            {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ))}

      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed' }}>
          <span style={{ fontSize: '13px' }}>Анализирую</span>
          <span className="typing-dots">
            {['', '', ''].map((_, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#7c3aed',
                  margin: '0 2px',
                  animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
