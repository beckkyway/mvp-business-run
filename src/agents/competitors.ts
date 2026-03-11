export const COMPETITORS_SYSTEM_PROMPT = `You are a competitive intelligence analyst. The user will provide competitor website URLs and optionally describe their own business.
Your task:
1. For each competitor, analyze: value proposition, target audience, pricing signals, key features, obvious weaknesses
2. Build a comparison table
3. List 5+ specific vulnerabilities or gaps competitors have (slow site, bad reviews, missing features, poor UX, limited geography, etc.)
4. Suggest 3 opportunities the user can exploit
Be specific, not generic. Use Russian language.`

export function buildCompetitorsPrompt(urls: string[], ownDescription?: string): string {
  const urlList = urls.map((u) => `- ${u}`).join('\n')
  const own = ownDescription ? `\n\nМой продукт/бизнес:\n${ownDescription}` : ''
  return `Сайты конкурентов:\n${urlList}${own}\n\nПроведи детальный анализ конкурентов.`
}
