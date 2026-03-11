import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface ParsedFile {
  name: string
  type: 'csv' | 'xlsx' | 'pdf' | 'docx' | 'unknown'
  content: string
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

  if (ext === 'csv') {
    return parseCsv(file)
  } else if (ext === 'xlsx' || ext === 'xls') {
    return parseExcel(file)
  } else if (ext === 'pdf') {
    return parsePdf(file)
  } else if (ext === 'docx' || ext === 'doc') {
    return parseDocx(file)
  }

  return { name: file.name, type: 'unknown', content: 'Неподдерживаемый формат файла.' }
}

async function parseCsv(file: File): Promise<ParsedFile> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      complete: (results) => {
        const rows = results.data as string[][]
        const content = rows.map((row) => row.join('\t')).join('\n')
        resolve({ name: file.name, type: 'csv', content })
      },
      error: () => {
        resolve({ name: file.name, type: 'csv', content: 'Ошибка при чтении CSV файла.' })
      },
    })
  })
}

async function parseExcel(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheets: string[] = []

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    sheets.push(`=== Лист: ${sheetName} ===\n${csv}`)
  }

  return { name: file.name, type: 'xlsx', content: sheets.join('\n\n') }
}

async function parsePdf(file: File): Promise<ParsedFile> {
  // Browser-based PDF text extraction via PDF.js (CDN fallback)
  try {
    const arrayBuffer = await file.arrayBuffer()
    // Simple text extraction — for MVP we read raw bytes and extract visible text
    const text = await extractPdfText(arrayBuffer)
    return { name: file.name, type: 'pdf', content: text }
  } catch {
    return { name: file.name, type: 'pdf', content: 'Не удалось прочитать PDF. Попробуйте скопировать текст вручную.' }
  }
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  // Load PDF.js dynamically from CDN
  const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/build/pdf.min.mjs' as string) as {
    getDocument: (src: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str?: string }[] }> }> }> }
    GlobalWorkerOptions: { workerSrc: string }
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs'

  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const pages: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const text = textContent.items.map((item) => item.str ?? '').join(' ')
    pages.push(text)
  }

  return pages.join('\n\n')
}

async function parseDocx(file: File): Promise<ParsedFile> {
  const mammoth = await import('mammoth')
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return { name: file.name, type: 'docx', content: result.value }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
