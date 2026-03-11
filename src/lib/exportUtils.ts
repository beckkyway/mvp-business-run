import * as XLSX from 'xlsx'

// Parse markdown tables into structured data
function parseMarkdownTables(markdown: string): { title: string; headers: string[]; rows: string[][] }[] {
  const tables: { title: string; headers: string[]; rows: string[][] }[] = []
  const lines = markdown.split('\n')

  let currentTitle = ''
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()

    // Track headings as table titles
    if (line.startsWith('#')) {
      currentTitle = line.replace(/^#+\s*/, '')
      i++
      continue
    }

    // Detect markdown table (line with |)
    if (line.startsWith('|') && line.endsWith('|')) {
      const headerLine = line
      const separatorLine = lines[i + 1]?.trim() ?? ''

      // Validate separator row (---|---|---)
      if (!separatorLine.startsWith('|') || !separatorLine.includes('-')) {
        i++
        continue
      }

      const headers = headerLine
        .split('|')
        .slice(1, -1)
        .map((h) => h.trim())

      const rows: string[][] = []
      let j = i + 2

      while (j < lines.length) {
        const rowLine = lines[j].trim()
        if (!rowLine.startsWith('|') || !rowLine.endsWith('|')) break
        const cells = rowLine
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim())
        rows.push(cells)
        j++
      }

      if (rows.length > 0) {
        tables.push({ title: currentTitle, headers, rows })
      }

      i = j
      continue
    }

    i++
  }

  return tables
}

export function exportToExcel(markdownContent: string, agentName: string): void {
  const workbook = XLSX.utils.book_new()
  const tables = parseMarkdownTables(markdownContent)

  if (tables.length === 0) {
    // No tables found — export as plain text
    const textRows = markdownContent
      .split('\n')
      .map((line) => [line.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/`/g, '')])

    const ws = XLSX.utils.aoa_to_sheet([['Результат анализа'], [''], ...textRows])
    ws['A1'] = { v: 'Результат анализа', t: 's' }
    XLSX.utils.book_append_sheet(workbook, ws, 'Анализ')
  } else {
    tables.forEach((table, idx) => {
      const sheetName = (table.title || `Таблица ${idx + 1}`).slice(0, 31)
      const data = [table.headers, ...table.rows]
      const ws = XLSX.utils.aoa_to_sheet(data)

      // Style header row width
      ws['!cols'] = table.headers.map(() => ({ wch: 20 }))

      XLSX.utils.book_append_sheet(workbook, ws, sheetName)
    })

    // Also add full text as last sheet
    const textRows = markdownContent
      .split('\n')
      .map((line) => [line.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/`/g, '')])
    const wsText = XLSX.utils.aoa_to_sheet(textRows)
    XLSX.utils.book_append_sheet(workbook, wsText, 'Полный отчёт')
  }

  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `${agentName}_${date}.xlsx`)
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}
