# Business Analytics MVP — Project Brief

## Overview

Build a **Business Analytics Platform** — a modern web app where entrepreneurs can interact with specialized AI agents to get business insights. The app uses **OpenRouter API** as the LLM backend.

---

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **LLM**: OpenRouter API (user provides their own key)
- **File parsing**: `pdf-parse`, `xlsx`, `mammoth`
- **Backend**: FastAPI (Python) or Next.js API routes — your choice
- **Storage**: localStorage for session data (MVP), PostgreSQL for persistence later
- **Charts**: Recharts

---

## Layout & Design Requirements

### Overall Design Language
- **Dark theme** with glassmorphism cards (dark navy `#0f172a` background, cards with `rgba(255,255,255,0.05)` + backdrop blur)
- Accent color: **electric violet `#7c3aed`** with neon glow effects on active elements
- Smooth transitions everywhere (150–300ms ease)
- Modern sans-serif font: **Inter**
- Subtle animated gradient in the background (slow, non-distracting)

### Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│  HEADER: Logo  |  "Business AI"  |  [API Key]  [Settings]  │
├──────────────┬─────────────────────────────────────────────┤
│              │                                             │
│  LEFT        │         MAIN CONTENT AREA                  │
│  SIDEBAR     │                                             │
│  (agents)    │  → Welcome screen when no agent selected   │
│              │  → Agent workspace when agent is active    │
│  [Agent 1]   │                                             │
│  [Agent 2]   │                                             │
│  [Agent 3]   │                                             │
│  [Agent 4]   │                                             │
│  [Agent 5]   │
│  [Agent 6]   │                                             │
│              │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

### Sidebar
- Width: `280px`, fixed, dark `#0d1117` background
- Each agent is a **card** with: icon (emoji or SVG), agent name, short description, status badge
- **Active state**: glowing left border in accent color, card background lightens
- Hover: smooth scale + glow
- Cards stacked vertically with `12px` gap

### Main Content Area
- When no agent selected: **beautiful welcome screen** with animated cards previewing each agent's capability
- When agent selected: split into two panels:
  - **Top**: Agent description + controls (upload button, input fields)
  - **Bottom**: Chat/result window — streaming responses, markdown rendered, code blocks highlighted

---

## Agents (6 total)

### 1. 📊 Финансовый аналитик
**ID**: `finance`
**Description**: Загрузи документ с доходами и расходами — получи полный финансовый отчёт.

**User flow**:
1. User uploads PDF / Excel / CSV with financial data
2. App parses file → extracts raw data
3. Sends to OpenRouter with prompt to analyze, structure, calculate P&L, find anomalies
4. Renders markdown report with tables
5. **Export button** → generates downloadable Excel report with charts

**System prompt**:
```
You are a professional financial analyst. The user will provide raw financial data from a document.
Your task:
1. Structure all income and expense items into clear categories
2. Calculate: total revenue, total expenses, net profit/loss, profit margin
3. Identify the top 3 expense categories
4. Spot any anomalies or concerning trends
5. Provide 3 concrete recommendations to improve profitability
Format your response in clean Markdown with tables. Use Russian language.
```

---

### 2. 🔍 Анализ конкурентов
**ID**: `competitors`
**Description**: Введи сайты конкурентов — получи их слабые места и возможности для тебя.

**User flow**:
1. Text input: user pastes a list of competitor URLs (one per line)
2. Optional: user describes their own product in a text field
3. Agent scrapes/analyzes each URL (via OpenRouter with web browsing, or send URLs and let LLM reason about them)
4. Returns comparison table + vulnerability report

**System prompt**:
```
You are a competitive intelligence analyst. The user will provide competitor website URLs and optionally describe their own business.
Your task:
1. For each competitor, analyze: value proposition, target audience, pricing signals, key features, obvious weaknesses
2. Build a comparison table
3. List 5+ specific vulnerabilities or gaps competitors have (slow site, bad reviews, missing features, poor UX, limited geography, etc.)
4. Suggest 3 opportunities the user can exploit
Be specific, not generic. Use Russian language.
```

---

### 3. 🚚 Управление поставками
**ID**: `supply`
**Description**: Загрузи список поставщиков и заказов — получи оптимизацию и риск-анализ.

**User flow**:
1. User uploads Excel/CSV with supplier data (name, price, lead time, reliability score, category)
2. Agent analyzes dependencies, calculates risk scores, suggests alternatives
3. Outputs structured report + risk matrix

**System prompt**:
```
You are a supply chain optimization expert. Analyze the provided supplier and order data.
Your task:
1. Identify single-source dependencies (risk: one supplier for critical item)
2. Calculate a risk score (1–10) for each supplier based on lead time and reliability
3. Flag suppliers with high risk
4. Suggest diversification strategies
5. Recommend optimal order quantities to reduce costs
Use Russian language. Format with tables and clear sections.
```

---

### 4. ⚖️ Юридический ассистент
**ID**: `legal`
**Description**: Загрузи договор — получи анализ рисков и опасных пунктов.

**User flow**:
1. User uploads PDF/DOCX contract
2. Agent parses text, analyzes clauses
3. Highlights risky clauses (highlighted in red in the UI), neutral (yellow), safe (green)
4. Provides plain-language summary

**System prompt**:
```
You are a business lawyer assistant. The user will provide a contract document.
Your task:
1. Identify risky clauses: unlimited liability, unfair termination, IP ownership transfer, hidden auto-renewals
2. Rate each clause: 🔴 High Risk / 🟡 Medium Risk / 🟢 Safe
3. Explain each risky clause in plain Russian language (no legal jargon)
4. Suggest how each risky clause should be reworded
5. Give an overall contract risk score (1–10)
Use Russian language.
```

---

### 5. 📈 Прогноз продаж
**ID**: `forecast`
**Description**: Загрузи исторические данные продаж — получи прогноз и рекомендации.

**User flow**:
1. User uploads sales history (Excel/CSV with date + revenue columns)
2. App extracts data, calculates trends
3. Agent forecasts next 3 months + seasonal patterns

**System prompt**:
```
You are a sales forecasting expert. The user provides historical sales data.
Your task:
1. Identify the trend: growing, declining, or flat
2. Spot seasonality patterns
3. Forecast revenue for the next 3 months with optimistic/realistic/pessimistic scenarios
4. Explain what's driving the trend
5. Give 3 actionable recommendations to improve sales
Provide specific numbers. Use Russian language.
```

---

### 6. 👥 HR-аналитика
**ID**: `hr`
**Description**: Загрузи данные по сотрудникам — получи анализ эффективности, ФОТ и рекомендации.

**User flow**:
1. User uploads Excel/CSV with employee data (name, role, salary, KPI score, sick days, department)
2. App parses file → extracts structured table
3. Agent calculates efficiency metrics, ФОТ breakdown, flags underperformers and overloaded employees
4. Outputs report with department comparison + actionable HR recommendations
5. **Export button** → downloadable Excel with charts (ФОТ по отделам, KPI распределение)

**System prompt**:
```
You are a professional HR analyst. The user will provide employee data including salaries, KPI scores, sick days, and departments.
Your task:
1. Calculate total payroll (ФОТ) broken down by department
2. Calculate average KPI per department and identify top/bottom performers
3. Flag employees with high sick days (potential burnout or disengagement risk)
4. Calculate cost-efficiency ratio: salary vs KPI score for each employee
5. Identify the top 3 most expensive departments relative to their output
6. Provide 5 concrete HR recommendations: who to retain, who may need a performance review, where to optimize headcount costs
7. Highlight any red flags (e.g. high turnover risk, salary inequity in same roles)
Format as clean Markdown with tables. Use Russian language.
```

**Input columns expected** (inform user):
- `Имя` — employee name
- `Отдел` — department
- `Должность` — job title
- `Зарплата` — monthly salary (RUB)
- `KPI` — score 0–100
- `Больничные_дни` — sick days per year
- `Стаж_лет` — years at company (optional)

---

## OpenRouter Integration

```typescript
// src/lib/openrouter.ts
const OPENROUTER_BASE = "https://openrouter.ai/api/v1"

export async function callAgent(
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  model: string = "anthropic/claude-3-haiku", // cheap default
  onChunk?: (chunk: string) => void
): Promise<string> {
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://business-analytics-mvp.app",
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    })
  })
  // Handle SSE streaming...
}
```

**Model selector in UI**: let user pick model from dropdown:
- `anthropic/claude-3-haiku` (fast, cheap) ← default
- `anthropic/claude-3.5-sonnet` (best quality)
- `openai/gpt-4o-mini` (alternative)
- `google/gemini-flash-1.5` (very cheap)

**API Key**: stored in `localStorage`, entered via a settings modal on first launch. Show a masked input `sk-or-****` with a "Test Connection" button.

---

## File Parsing

```
User uploads file → frontend reads it →
PDF: use pdf-parse (Node) or pdfjs-dist (browser)
Excel: use SheetJS (xlsx library) in browser
CSV: Papa Parse
DOCX: mammoth.js
→ Extract raw text/data → pass to agent prompt
```

---

## UI Component Checklist

- [ ] `Sidebar.tsx` — agent cards list
- [ ] `AgentCard.tsx` — individual card with icon, name, status
- [ ] `WorkspacePanel.tsx` — main right panel
- [ ] `ChatWindow.tsx` — streaming chat output with markdown rendering (use `react-markdown`)
- [ ] `FileUpload.tsx` — drag-and-drop zone with preview
- [ ] `ApiKeyModal.tsx` — settings modal for OpenRouter key + model selection
- [ ] `WelcomeScreen.tsx` — animated landing when no agent selected
- [ ] `ExportButton.tsx` — download results as PDF or Excel

---

## MVP Scope (what to build first)

**Sprint 1** (core):
- Layout with sidebar + workspace
- Agent 1 (Finance) fully working end-to-end
- Agent 2 (Competitors) fully working
- OpenRouter integration with streaming

**Sprint 2**:
- Agent 3, 4, 5
- Export to Excel/PDF
- Model selector

**Sprint 3**:
- Polish animations
- History of past analyses (localStorage)
- Multi-language support

---

## Folder Structure

```
/
├── src/
│   ├── agents/
│   │   ├── finance.ts       # system prompts + logic
│   │   ├── competitors.ts
│   │   ├── supply.ts
│   │   ├── legal.ts
│   │   ├── forecast.ts
│   │   └── hr.ts
│   ├── components/
│   │   ├── Sidebar/
│   │   ├── Workspace/
│   │   ├── Chat/
│   │   └── ui/              # shadcn components
│   ├── lib/
│   │   ├── openrouter.ts
│   │   ├── fileParser.ts
│   │   └── exportUtils.ts
│   ├── store/               # Zustand state management
│   └── App.tsx
├── CLAUDE.md                # ← this file
├── package.json
└── vite.config.ts
```

---

## Key UX Principles

1. **Zero friction**: user opens app → sees agents → clicks one → uploads file or types → gets answer. Maximum 3 clicks to value.
2. **Streaming responses**: never show a loading spinner for more than 1 second. Stream LLM output in real time.
3. **Copy & Export**: every result has a "Copy" and "Export" button
4. **Error handling**: if API key is wrong or quota exceeded, show a friendly Russian-language error with a fix link
5. **Mobile-friendly**: sidebar collapses to bottom tab bar on mobile

---

*This CLAUDE.md serves as the single source of truth for the project. Every implementation decision should refer back to this document.*