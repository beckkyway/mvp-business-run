import { AgentId } from '../../store'

export interface AgentMeta {
  id: AgentId
  icon: string
  name: string
  description: string
}

export const AGENTS: AgentMeta[] = [
  {
    id: 'finance',
    icon: '📊',
    name: 'Финансовый аналитик',
    description: 'Загрузи документ с доходами и расходами — получи полный финансовый отчёт.',
  },
  {
    id: 'competitors',
    icon: '🔍',
    name: 'Анализ конкурентов',
    description: 'Введи сайты конкурентов — получи их слабые места и возможности для тебя.',
  },
  {
    id: 'supply',
    icon: '🚚',
    name: 'Управление поставками',
    description: 'Загрузи список поставщиков и заказов — получи оптимизацию и риск-анализ.',
  },
  {
    id: 'legal',
    icon: '⚖️',
    name: 'Юридический ассистент',
    description: 'Загрузи договор — получи анализ рисков и опасных пунктов.',
  },
  {
    id: 'forecast',
    icon: '📈',
    name: 'Прогноз продаж',
    description: 'Загрузи исторические данные продаж — получи прогноз и рекомендации.',
  },
  {
    id: 'hr',
    icon: '👥',
    name: 'HR-аналитика',
    description: 'Загрузи данные по сотрудникам — получи анализ эффективности, ФОТ и рекомендации.',
  },
]

interface AgentCardProps {
  agent: AgentMeta
  isActive: boolean
  messageCount: number
  onClick: () => void
}

export function AgentCard({ agent, isActive, messageCount, onClick }: AgentCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        background: isActive ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isActive ? 'rgba(124, 58, 237, 0.5)' : 'rgba(255,255,255,0.06)'}`,
        borderLeft: `3px solid ${isActive ? '#7c3aed' : 'transparent'}`,
        borderRadius: '10px',
        padding: '12px 14px',
        boxShadow: isActive ? '0 0 16px rgba(124,58,237,0.2)' : 'none',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <span style={{ fontSize: '22px', lineHeight: 1, flexShrink: 0 }}>{agent.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: isActive ? '#c4b5fd' : '#e2e8f0' }}>
              {agent.name}
            </div>
            {messageCount > 0 && (
              <span style={{
                fontSize: '10px',
                background: isActive ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.1)',
                color: isActive ? '#c4b5fd' : '#64748b',
                padding: '1px 6px',
                borderRadius: '10px',
                flexShrink: 0,
              }}>
                {messageCount}
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
            {agent.description}
          </div>
        </div>
      </div>
    </button>
  )
}
