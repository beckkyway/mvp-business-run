export const FORECAST_SYSTEM_PROMPT = `You are a sales forecasting expert. The user provides historical sales data.
Your task:
1. Identify the trend: growing, declining, or flat
2. Spot seasonality patterns
3. Forecast revenue for the next 3 months with optimistic/realistic/pessimistic scenarios
4. Explain what's driving the trend
5. Give 3 actionable recommendations to improve sales
Provide specific numbers. Use Russian language.`

export function buildForecastPrompt(fileContent: string, fileName: string): string {
  return `Файл: ${fileName}

Исторические данные продаж:
${fileContent}

Проведи анализ продаж и сделай прогноз на следующие 3 месяца.`
}
