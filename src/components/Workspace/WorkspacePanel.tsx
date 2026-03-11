import { useState, useRef, useCallback } from 'react'
import { useStore, AgentId, Message } from '../../store'
import { AGENTS } from '../Sidebar/AgentCard'
import { FileUpload } from './FileUpload'
import { ChatWindow } from '../Chat/ChatWindow'
import { ParsedFile } from '../../lib/fileParser'
import { callAgent, callAgentChat } from '../../lib/openrouter'
import { FINANCE_SYSTEM_PROMPT, buildFinancePrompt } from '../../agents/finance'
import { COMPETITORS_SYSTEM_PROMPT, buildCompetitorsPrompt } from '../../agents/competitors'
import { SUPPLY_SYSTEM_PROMPT, buildSupplyPrompt } from '../../agents/supply'
import { LEGAL_SYSTEM_PROMPT, buildLegalPrompt } from '../../agents/legal'
import { FORECAST_SYSTEM_PROMPT, buildForecastPrompt } from '../../agents/forecast'
import { HR_SYSTEM_PROMPT, buildHrPrompt } from '../../agents/hr'

function getAgentPrompts(agentId: AgentId): { system: string; buildUser: (data: string, name?: string) => string } {
  switch (agentId) {
    case 'finance': return { system: FINANCE_SYSTEM_PROMPT, buildUser: (d, n) => buildFinancePrompt(d, n ?? '') }
    case 'competitors': return { system: COMPETITORS_SYSTEM_PROMPT, buildUser: (d) => buildCompetitorsPrompt(d.split('\n').filter(Boolean)) }
    case 'supply': return { system: SUPPLY_SYSTEM_PROMPT, buildUser: (d, n) => buildSupplyPrompt(d, n ?? '') }
    case 'legal': return { system: LEGAL_SYSTEM_PROMPT, buildUser: (d, n) => buildLegalPrompt(d, n ?? '') }
    case 'forecast': return { system: FORECAST_SYSTEM_PROMPT, buildUser: (d, n) => buildForecastPrompt(d, n ?? '') }
    case 'hr': return { system: HR_SYSTEM_PROMPT, buildUser: (d, n) => buildHrPrompt(d, n ?? '') }
  }
}

interface WorkspacePanelProps {
  agentId: AgentId
}

export function WorkspacePanel({ agentId }: WorkspacePanelProps) {
  const { apiKey, model, agentStates, addMessage, updateLastMessage, setLoading, clearMessages } = useStore()
  const agent = AGENTS.find((a) => a.id === agentId)!
  const state = agentStates[agentId] ?? { messages: [], isLoading: false }

  const [textInput, setTextInput] = useState('')
  const [followUpInput, setFollowUpInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const needsFile = agentId !== 'competitors'
  const needsText = agentId === 'competitors'
  const hasMessages = state.messages.length > 0

  const startStream = useCallback(async (
    userDisplayText: string,
    buildRequest: (signal: AbortSignal) => Promise<string>
  ) => {
    if (!apiKey) {
      setError('Введите API ключ в настройках (кнопка вверху справа).')
      return
    }
    setError(null)

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userDisplayText, timestamp: Date.now() }
    addMessage(agentId, userMsg)
    setLoading(agentId, true)

    const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', timestamp: Date.now() }
    addMessage(agentId, assistantMsg)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      await buildRequest(controller.signal)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Неизвестная ошибка'
      if (msg === 'ABORTED') {
        const msgs = useStore.getState().agentStates[agentId]?.messages ?? []
        const current = msgs[msgs.length - 1]?.content ?? ''
        updateLastMessage(agentId, current + '\n\n_⏹ Остановлено_')
      } else {
        updateLastMessage(agentId, `❌ ${msg}`)
        setError(msg)
      }
    } finally {
      setLoading(agentId, false)
      abortRef.current = null
    }
  }, [agentId, apiKey, model, addMessage, updateLastMessage, setLoading])

  const handleFileUpload = (parsed: ParsedFile) => {
    if (!parsed.content.trim() || parsed.content.length < 20) {
      setError('Файл пустой или не удалось извлечь текст. Попробуйте другой формат.')
      return
    }
    const { system, buildUser } = getAgentPrompts(agentId)
    startStream(`📎 Файл загружен: ${parsed.name}`, (signal) =>
      callAgent(system, buildUser(parsed.content, parsed.name), apiKey, model,
        (chunk) => updateLastMessage(agentId, chunk), signal)
    )
  }

  const handleTextSubmit = () => {
    if (!textInput.trim()) return
    const text = textInput.trim()
    setTextInput('')
    const { system, buildUser } = getAgentPrompts(agentId)
    startStream(text, (signal) =>
      callAgent(system, buildUser(text), apiKey, model,
        (chunk) => updateLastMessage(agentId, chunk), signal)
    )
  }

  const handleFollowUp = () => {
    if (!followUpInput.trim() || state.isLoading) return
    const question = followUpInput.trim()
    setFollowUpInput('')
    const { system } = getAgentPrompts(agentId)
    const history = state.messages
      .filter((m) => m.content)
      .map((m) => ({ role: m.role, content: m.content }))
    history.push({ role: 'user', content: question })
    startStream(question, (signal) =>
      callAgentChat(system, history, apiKey, model,
        (chunk) => updateLastMessage(agentId, chunk), signal)
    )
  }

  const handleStop = () => {
    abortRef.current?.abort()
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Agent header */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: hasMessages ? '0' : '16px' }}>
          <span style={{ fontSize: '26px' }}>{agent.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>{agent.name}</div>
            {!hasMessages && (
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{agent.description}</div>
            )}
          </div>

          {state.isLoading && (
            <button
              onClick={handleStop}
              style={{
                padding: '6px 14px',
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.35)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ⏹ Стоп
            </button>
          )}

          {hasMessages && !state.isLoading && (
            <button
              onClick={() => clearMessages(agentId)}
              style={{
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#64748b',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Очистить
            </button>
          )}
        </div>

        {/* Initial input — hide once conversation started */}
        {!hasMessages && (
          <>
            {needsFile && <FileUpload onParsed={handleFileUpload} />}

            {needsText && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={'Введите URL конкурентов (по одному на строку)\nhttps://competitor1.ru\nhttps://competitor2.ru'}
                  rows={3}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '12px',
                    color: '#e2e8f0',
                    fontSize: '13px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={state.isLoading || !textInput.trim()}
                  style={{
                    padding: '12px 20px',
                    background: state.isLoading ? 'rgba(124,58,237,0.3)' : '#7c3aed',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: state.isLoading ? 'not-allowed' : 'pointer',
                    alignSelf: 'flex-end',
                    transition: 'all 0.2s',
                  }}
                >
                  Анализ
                </button>
              </div>
            )}
          </>
        )}

        {error && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Chat window */}
      <ChatWindow messages={state.messages} isLoading={state.isLoading} agentName={agent.name} />

      {/* Follow-up input — appears after first response */}
      {hasMessages && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
            flexShrink: 0,
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end',
          }}
        >
          {needsFile && (
            <label
              title="Загрузить новый файл"
              style={{
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#64748b',
                fontSize: '16px',
                cursor: 'pointer',
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              📎
              <input
                type="file"
                accept=".pdf,.xlsx,.xls,.csv,.docx,.doc"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const { parseFile } = await import('../../lib/fileParser')
                  const parsed = await parseFile(file)
                  handleFileUpload(parsed)
                  e.target.value = ''
                }}
              />
            </label>
          )}

          <textarea
            value={followUpInput}
            onChange={(e) => setFollowUpInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleFollowUp()
              }
            }}
            placeholder="Уточняющий вопрос... (Enter — отправить, Shift+Enter — новая строка)"
            rows={1}
            disabled={state.isLoading}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#e2e8f0',
              fontSize: '13px',
              resize: 'none',
              fontFamily: 'inherit',
              outline: 'none',
              lineHeight: 1.5,
              opacity: state.isLoading ? 0.5 : 1,
            }}
          />
          <button
            onClick={handleFollowUp}
            disabled={state.isLoading || !followUpInput.trim()}
            style={{
              padding: '10px 18px',
              background: state.isLoading || !followUpInput.trim() ? 'rgba(124,58,237,0.2)' : '#7c3aed',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '16px',
              cursor: state.isLoading || !followUpInput.trim() ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            ↑
          </button>
        </div>
      )}
    </div>
  )
}
