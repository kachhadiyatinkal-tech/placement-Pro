import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

/** Never exported to CSV/PDF (IDs, secrets, version key). */
export const EXCLUDED_EXPORT_KEYS = new Set(['_id', '__v', 'password', 'token'])

function isMongoIdString(v) {
  return typeof v === 'string' && /^[a-f\d]{24}$/i.test(v)
}

/** Drop Mongo _id / secrets / duplicate id fields from a plain object row. */
export function sanitizeRowForExport(row) {
  if (!row || typeof row !== 'object') return {}
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    if (EXCLUDED_EXPORT_KEYS.has(k)) continue
    if (k === 'id' && isMongoIdString(v)) continue
    out[k] = v
  }
  return out
}

function humanizeKey(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

function cellValue(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (v instanceof Date) return v.toLocaleString()
  if (typeof v === 'object') {
    if (Array.isArray(v)) {
      return v
        .map((x) => (x !== null && typeof x === 'object' ? JSON.stringify(x) : String(x)))
        .join(', ')
    }
    try {
      return JSON.stringify(v)
    } catch {
      return String(v)
    }
  }
  return String(v)
}

function inferColumnsFromRows(rows) {
  const keys = new Set()
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    for (const k of Object.keys(row)) {
      if (EXCLUDED_EXPORT_KEYS.has(k)) continue
      if (k === 'id' && isMongoIdString(row[k])) continue
      keys.add(k)
    }
  }
  return Array.from(keys)
}

function toCSVValue(value) {
  if (value === null || value === undefined) return '""'
  const s = String(value)
  const escaped = s.replaceAll('"', '""')
  return `"${escaped}"`
}

function inferColumnsCSV(rows) {
  const first = rows?.find(Boolean)
  if (!first || typeof first !== 'object') return []
  const keys = Object.keys(first)
  return keys.filter((k) => !EXCLUDED_EXPORT_KEYS.has(k) && !(k === 'id' && isMongoIdString(first[k])))
}

export function downloadCSV(filename, rows, columns) {
  const safeRows = Array.isArray(rows) ? rows.map(sanitizeRowForExport) : []
  const safeColumns = columns?.length ? columns.filter((c) => !EXCLUDED_EXPORT_KEYS.has(c)) : inferColumnsCSV(safeRows)

  const header = safeColumns.map(toCSVValue).join(',')
  const body = safeRows
    .map((row) => {
      const r = typeof row === 'object' && row ? row : {}
      const line = safeColumns.map((col) => toCSVValue(r[col])).join(',')
      return line
    })
    .join('\n')

  const csv = `${header}\n${body}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/**
 * Table PDF (landscape A4). Omits _id and other sensitive fields automatically.
 * @param {string} filename - e.g. `report.pdf` or `report` (`.pdf` added if missing)
 * @param {object[]} rows - array of plain objects
 * @param {string[]|undefined} columns - optional column keys (order preserved)
 * @param {{ title?: string }} options - optional document title
 */
export function downloadPDF(filename, rows, columns, options = {}) {
  const { title } = options
  const raw = Array.isArray(rows) ? rows : []
  const safeRows = raw.map(sanitizeRowForExport)

  let cols = columns?.length
    ? columns.filter((c) => c && !EXCLUDED_EXPORT_KEYS.has(c) && c !== '_id')
    : inferColumnsFromRows(safeRows)

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const pageMargin = 40
  let y = pageMargin

  doc.setFontSize(12)
  doc.setTextColor(33, 37, 41)
  const baseName = String(filename || 'export')
    .replace(/\.pdf$/i, '')
    .replace(/\.csv$/i, '')
  const docTitle = title || baseName.replace(/[-_]/g, ' ')
  doc.text(docTitle, pageMargin, y)
  y += 28

  function ensurePdfName(name) {
    const s = String(name || 'export').replace(/\.csv$/i, '')
    return s.toLowerCase().endsWith('.pdf') ? s : `${s}.pdf`
  }

  if (!safeRows.length) {
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text('No data to export.', pageMargin, y)
    doc.save(ensurePdfName(filename))
    return
  }

  if (!cols.length) {
    cols = inferColumnsFromRows(safeRows)
  }

  const head = [cols.map((c) => humanizeKey(c))]
  const body = safeRows.map((row) => cols.map((c) => cellValue(row[c])))

  autoTable(doc, {
    head,
    body,
    startY: y,
    margin: { left: pageMargin, right: pageMargin },
    styles: { fontSize: 7, cellPadding: 3, overflow: 'linebreak', valign: 'top' },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    tableWidth: 'auto',
  })

  doc.save(ensurePdfName(filename))
}

export function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
