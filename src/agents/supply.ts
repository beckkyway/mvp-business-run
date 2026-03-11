export const SUPPLY_SYSTEM_PROMPT = `You are a supply chain optimization expert. Analyze the provided supplier and order data.
Your task:
1. Identify single-source dependencies (risk: one supplier for critical item)
2. Calculate a risk score (1–10) for each supplier based on lead time and reliability
3. Flag suppliers with high risk
4. Suggest diversification strategies
5. Recommend optimal order quantities to reduce costs
Use Russian language. Format with tables and clear sections.`

export function buildSupplyPrompt(fileContent: string, fileName: string): string {
  return `Файл: ${fileName}

Данные по поставщикам:
${fileContent}

Проведи анализ цепочки поставок и риск-анализ.`
}
