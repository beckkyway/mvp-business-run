import { useCallback, useState } from 'react'
import { ParsedFile, parseFile, formatFileSize } from '../../lib/fileParser'

interface FileUploadProps {
  accept?: string
  onParsed: (file: ParsedFile, raw: File) => void
  label?: string
}

export function FileUpload({ accept = '.pdf,.xlsx,.xls,.csv,.docx,.doc', onParsed, label }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setIsParsing(true)
      setUploadedFile({ name: file.name, size: file.size })
      try {
        const parsed = await parseFile(file)
        onParsed(parsed, file)
      } finally {
        setIsParsing(false)
      }
    },
    [onParsed]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '24px',
        background: isDragging ? 'rgba(124, 58, 237, 0.1)' : 'rgba(255,255,255,0.03)',
        border: `2px dashed ${isDragging ? '#7c3aed' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minHeight: '120px',
      }}
    >
      <input type="file" accept={accept} onChange={onInputChange} style={{ display: 'none' }} />

      {isParsing ? (
        <div style={{ color: '#7c3aed', fontSize: '14px' }}>Читаю файл...</div>
      ) : uploadedFile ? (
        <>
          <div style={{ fontSize: '28px' }}>✅</div>
          <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>
            <div style={{ fontWeight: 500, color: '#e2e8f0' }}>{uploadedFile.name}</div>
            <div>{formatFileSize(uploadedFile.size)}</div>
          </div>
          <div style={{ fontSize: '11px', color: '#475569' }}>Кликните, чтобы заменить</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: '32px' }}>📁</div>
          <div style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center' }}>
            {label ?? 'Перетащите файл или кликните для выбора'}
          </div>
          <div style={{ fontSize: '12px', color: '#475569' }}>
            PDF, Excel, CSV, DOCX
          </div>
        </>
      )}
    </label>
  )
}
