import type { Indicator } from '../types'

export function formatValue(value: number, indicator: Indicator): string {
  if (!isFinite(value)) return '—'
  switch (indicator.format) {
    case 'percent': return `${value.toFixed(1)}%`
    case 'rate':    return `${value.toFixed(2)}%`
    case 'currency': return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    default: {
      // Large number formatting
      if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
      if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`
      return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
    }
  }
}

export function formatChange(change: number, pct: number, indicator: Indicator): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${formatValue(change, indicator)} (${sign}${pct.toFixed(1)}%)`
}

export function isPositiveChange(change: number, indicator: Indicator): boolean {
  return indicator.positiveDirection === 'up' ? change >= 0 : change <= 0
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function downloadCSV(data: Array<Record<string, unknown>>, filename: string) {
  const headers = Object.keys(data[0] ?? {})
  const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadJSON(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// Color palette — colorblind-safe, perceptually uniform
export const CHART_COLORS = [
  '#008751', // Nigeria green
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#10b981', // emerald
]

export function categoryColor(category: string): string {
  const map: Record<string, string> = {
    gdp:       '#008751',
    inflation: '#f59e0b',
    labour:    '#8b5cf6',
    exchange:  '#3b82f6',
    interest:  '#06b6d4',
    trade:     '#10b981',
    fiscal:    '#ef4444',
    external:  '#f97316',
    commodity: '#eab308',
    markets:   '#ec4899',
    leading:   '#14b8a6',
  }
  return map[category] ?? '#94a3b8'
}
