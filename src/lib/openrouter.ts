const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

async function streamCompletion(
  messages: ChatMessage[],
  apiKey: string,
  model: string,
  onChunk?: (accumulated: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://business-analytics-mvp.app',
      'X-Title': 'Business AI Analytics',
    },
    body: JSON.stringify({ model, stream: true, messages }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const msg = (error as { error?: { message?: string } }).error?.message || response.statusText
    if (response.status === 401) throw new Error('Неверный API ключ. Проверьте ключ в настройках.')
    if (response.status === 429) throw new Error('Превышен лимит запросов. Попробуйте позже или смените модель.')
    throw new Error(`Ошибка API: ${msg}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            fullText += content
            onChunk?.(fullText)
          }
        } catch { /* skip malformed */ }
      }
    }
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new Error('ABORTED')
    throw e
  }

  return fullText
}

export async function callAgent(
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  model: string = 'anthropic/claude-3-haiku',
  onChunk?: (chunk: string) => void,
  signal?: AbortSignal
): Promise<string> {
  return streamCompletion(
    [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
    apiKey, model, onChunk, signal
  )
}

export async function callAgentChat(
  systemPrompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  apiKey: string,
  model: string = 'anthropic/claude-3-haiku',
  onChunk?: (chunk: string) => void,
  signal?: AbortSignal
): Promise<string> {
  return streamCompletion(
    [{ role: 'system', content: systemPrompt }, ...history],
    apiKey, model, onChunk, signal
  )
}

export async function testConnection(apiKey: string): Promise<boolean> {
  const response = await fetch(`${OPENROUTER_BASE}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  return response.ok
}
