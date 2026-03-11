import { useStore } from '../../store'
import { AGENTS } from '../Sidebar/AgentCard'

export function WelcomeScreen() {
  const { setActiveAgent } = useStore()

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        gap: '40px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#e2e8f0', marginBottom: '12px' }}>
          Business AI Platform
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '480px', lineHeight: 1.6 }}>
          Выберите AI-агента слева или нажмите на карточку ниже, чтобы начать анализ вашего бизнеса
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          width: '100%',
          maxWidth: '900px',
        }}
      >
        {AGENTS.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setActiveAgent(agent.id)}
            style={{
              textAlign: 'left',
              padding: '20px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.background = 'rgba(124,58,237,0.1)'
              el.style.borderColor = 'rgba(124,58,237,0.4)'
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 8px 24px rgba(124,58,237,0.15)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.background = 'rgba(255,255,255,0.04)'
              el.style.borderColor = 'rgba(255,255,255,0.08)'
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = 'none'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{agent.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>
              {agent.name}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
              {agent.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
