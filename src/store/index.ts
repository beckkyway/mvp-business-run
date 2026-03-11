import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AgentId = 'finance' | 'competitors' | 'supply' | 'legal' | 'forecast' | 'hr'

export type ModelId =
  | 'anthropic/claude-3-haiku'
  | 'anthropic/claude-3.5-sonnet'
  | 'openai/gpt-4o-mini'
  | 'google/gemini-flash-1.5'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface AgentState {
  messages: Message[]
  isLoading: boolean
}

interface AppStore {
  // Settings
  apiKey: string
  model: ModelId
  setApiKey: (key: string) => void
  setModel: (model: ModelId) => void

  // UI state
  activeAgent: AgentId | null
  isSettingsOpen: boolean
  setActiveAgent: (id: AgentId | null) => void
  setSettingsOpen: (open: boolean) => void

  // Agent conversations
  agentStates: Record<AgentId, AgentState>
  addMessage: (agentId: AgentId, message: Message) => void
  updateLastMessage: (agentId: AgentId, content: string) => void
  setLoading: (agentId: AgentId, loading: boolean) => void
  clearMessages: (agentId: AgentId) => void
}

const defaultAgentState = (): AgentState => ({
  messages: [],
  isLoading: false,
})

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      // Settings
      apiKey: '',
      model: 'anthropic/claude-3-haiku',
      setApiKey: (key) => set({ apiKey: key }),
      setModel: (model) => set({ model }),

      // UI state
      activeAgent: null,
      isSettingsOpen: false,
      setActiveAgent: (id) => set({ activeAgent: id }),
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),

      // Agent conversations
      agentStates: {
        finance: defaultAgentState(),
        competitors: defaultAgentState(),
        supply: defaultAgentState(),
        legal: defaultAgentState(),
        forecast: defaultAgentState(),
        hr: defaultAgentState(),
      },

      addMessage: (agentId, message) =>
        set((state) => ({
          agentStates: {
            ...state.agentStates,
            [agentId]: {
              ...state.agentStates[agentId],
              messages: [...state.agentStates[agentId].messages, message],
            },
          },
        })),

      updateLastMessage: (agentId, content) =>
        set((state) => {
          const messages = [...state.agentStates[agentId].messages]
          if (messages.length > 0) {
            messages[messages.length - 1] = {
              ...messages[messages.length - 1],
              content,
            }
          }
          return {
            agentStates: {
              ...state.agentStates,
              [agentId]: { ...state.agentStates[agentId], messages },
            },
          }
        }),

      setLoading: (agentId, loading) =>
        set((state) => ({
          agentStates: {
            ...state.agentStates,
            [agentId]: { ...state.agentStates[agentId], isLoading: loading },
          },
        })),

      clearMessages: (agentId) =>
        set((state) => ({
          agentStates: {
            ...state.agentStates,
            [agentId]: defaultAgentState(),
          },
        })),
    }),
    {
      name: 'business-ai-storage',
      partialize: (state) => ({
        apiKey: state.apiKey,
        model: state.model,
        agentStates: state.agentStates,
      }),
    }
  )
)
