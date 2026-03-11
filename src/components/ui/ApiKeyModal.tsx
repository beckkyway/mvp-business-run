import { useState } from 'react'
import { useStore, ModelId } from '../../store'
import { testConnection } from '../../lib/openrouter'

const MODELS: { id: ModelId; label: string; badge?: string }[] = [
  { id: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku', badge: 'быстрый' },
  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', badge: 'лучший' },
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', badge: 'альтернатива' },
  { id: 'google/gemini-flash-1.5', label: 'Gemini Flash 1.5', badge: 'дешёвый' },
]

interface ApiKeyModalProps {
  onClose: () => void
}

export function ApiKeyModal({ onClose }: ApiKeyModalProps) {
  const { apiKey, model, setApiKey, setModel } = useStore()
  const [inputKey, setInputKey] = useState(apiKey)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null)

  const handleSave = () => {
    setApiKey(inputKey.trim())
    onClose()
  }

  const handleTest = async () => {
    if (!inputKey.trim()) return
    setTesting(true)
    setTestResult(null)
    const ok = await testConnection(inputKey.trim()).catch(() => false)
    setTestResult(ok ? 'success' : 'fail')
    setTesting(false)
  }

  const maskedKey = inputKey
    ? inputKey.slice(0, 8) + '****' + inputKey.slice(-4)
    : ''

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#1e293b',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '28px',
          width: '440px',
          maxWidth: '90vw',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
          ⚙️ Настройки
        </div>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
          Введите ключ OpenRouter для работы с AI агентами
        </div>

        {/* API Key */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            API Ключ OpenRouter
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => { setInputKey(e.target.value); setTestResult(null) }}
              placeholder="sk-or-v1-..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#e2e8f0',
                fontSize: '13px',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
            <button
              onClick={handleTest}
              disabled={testing || !inputKey.trim()}
              style={{
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#94a3b8',
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {testing ? '...' : 'Тест'}
            </button>
          </div>

          {inputKey && (
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
              {maskedKey}
            </div>
          )}

          {testResult === 'success' && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#4ade80' }}>
              ✅ Подключение успешно
            </div>
          )}
          {testResult === 'fail' && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#f87171' }}>
              ❌ Неверный ключ или нет подключения
            </div>
          )}
        </div>

        {/* Model selector */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            Модель
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: model === m.id ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${model === m.id ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: model === m.id ? '#c4b5fd' : '#e2e8f0', fontWeight: 500 }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace' }}>{m.id}</div>
                </div>
                {m.badge && (
                  <span style={{ fontSize: '11px', color: '#7c3aed', background: 'rgba(124,58,237,0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                    {m.badge}
                  </span>
                )}
                {model === m.id && <span style={{ color: '#7c3aed' }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#64748b',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 24px',
              background: '#7c3aed',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}
