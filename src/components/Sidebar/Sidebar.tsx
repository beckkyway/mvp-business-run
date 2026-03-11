import { useState } from 'react'
import { useStore } from '../../store'
import { AgentCard, AGENTS } from './AgentCard'

export function Sidebar() {
  const { activeAgent, setActiveAgent, agentStates } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '8px',
          paddingLeft: '4px',
        }}
      >
        AI Агенты
      </div>

      {AGENTS.map((agent) => {
        const msgCount = (agentStates[agent.id] ?? { messages: [] }).messages.filter(m => m.role === 'assistant' && m.content).length
        return (
          <AgentCard
            key={agent.id}
            agent={agent}
            isActive={activeAgent === agent.id}
            messageCount={msgCount}
            onClick={() => {
              setActiveAgent(activeAgent === agent.id ? null : agent.id)
              setMobileOpen(false)
            }}
          />
        )
      })}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="desktop-sidebar"
        style={{
          width: '280px',
          minWidth: '280px',
          background: '#0d1117',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          overflowY: 'auto',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile: hamburger button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        style={{
          display: 'none',
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 200,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#7c3aed',
          border: 'none',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(124,58,237,0.5)',
        }}
      >
        ☰
      </button>

      {/* Mobile: overlay drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            display: 'flex',
          }}
        >
          <div
            style={{ flex: 1, background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            style={{
              width: '280px',
              background: '#0d1117',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              overflowY: 'auto',
            }}
          >
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>Агенты</span>
              <button
                onClick={() => setMobileOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
