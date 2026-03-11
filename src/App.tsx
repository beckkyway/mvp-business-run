import { useEffect } from 'react'
import { useStore } from './store'
import { Sidebar } from './components/Sidebar/Sidebar'
import { WorkspacePanel } from './components/Workspace/WorkspacePanel'
import { WelcomeScreen } from './components/Workspace/WelcomeScreen'
import { ApiKeyModal } from './components/ui/ApiKeyModal'

export default function App() {
  const { activeAgent, apiKey, isSettingsOpen, setSettingsOpen } = useStore()

  // Auto-open settings if no API key
  useEffect(() => {
    if (!apiKey) setSettingsOpen(true)
  }, [])

  return (
    <div className="animated-bg" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          height: '56px',
          background: 'rgba(13, 17, 23, 0.8)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🤖</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>Business AI</span>
          <span
            style={{
              fontSize: '11px',
              color: '#7c3aed',
              background: 'rgba(124,58,237,0.15)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 500,
            }}
          >
            MVP
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* API key indicator */}
          <div
            style={{
              fontSize: '12px',
              color: apiKey ? '#4ade80' : '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: apiKey ? '#4ade80' : '#f59e0b',
              }}
            />
            {apiKey ? 'API подключён' : 'Нет API ключа'}
          </div>

          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              padding: '7px 16px',
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '8px',
              color: '#c4b5fd',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            ⚙️ Настройки
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />

        <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {activeAgent ? (
            <WorkspacePanel key={activeAgent} agentId={activeAgent} />
          ) : (
            <WelcomeScreen />
          )}
        </main>
      </div>

      {/* Settings modal */}
      {isSettingsOpen && <ApiKeyModal onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
