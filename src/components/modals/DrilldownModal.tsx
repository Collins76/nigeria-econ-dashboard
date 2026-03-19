import { X, Download, ExternalLink, FileText, Share2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { INDICATOR_MAP } from '../../data/indicators'
import { getTimeSeries } from '../../data/timeseries'
import { NARRATIVES } from '../../data/narratives'
import { EVENTS } from '../../data/events'
import { formatValue, formatDate, downloadCSV } from '../../utils/format'
import HeatmapChart from '../charts/HeatmapChart'

interface Props {
  indicatorId: string
  dateRange: { start: string; end: string }
  onClose: () => void
}

export default function DrilldownModal({ indicatorId, dateRange, onClose }: Props) {
  const indicator = INDICATOR_MAP[indicatorId]
  const series = getTimeSeries(indicatorId, dateRange.start, dateRange.end)
  const narrative = NARRATIVES[indicatorId]
  const events = EVENTS.filter(e => e.date >= dateRange.start && e.date <= dateRange.end)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    ref.current?.focus()
    return () => document.removeEventListener('keydown', handle)
  }, [onClose])

  const handleDownloadCSV = () => {
    downloadCSV(
      series.data.map(p => ({ indicator: indicator.name, date: p.date, value: p.value, units: indicator.units, source: indicator.source })),
      `${indicatorId}_${dateRange.start}_${dateRange.end}.csv`
    )
  }

  const handleShare = () => {
    const url = `${window.location.origin}?indicator=${indicatorId}&start=${dateRange.start}&end=${dateRange.end}`
    navigator.clipboard.writeText(url).then(() => alert('Link copied to clipboard!'))
  }

  if (!indicator) return null

  const latest = series.data[series.data.length - 1]
  const prev = series.data[series.data.length - 2]
  const change = latest && prev ? latest.value - prev.value : 0
  const changePct = prev && prev.value !== 0 ? (change / Math.abs(prev.value)) * 100 : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drilldown-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={ref}
        tabIndex={-1}
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin focus:outline-none"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
                {indicator.category.toUpperCase()}
              </span>
            </div>
            <h2 id="drilldown-title" className="text-xl font-bold text-slate-900 dark:text-white">
              {indicator.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{indicator.units} · {indicator.frequency}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mt-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">Latest value</div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {latest ? formatValue(latest.value, indicator) : '—'}
              </div>
              <div className="text-xs text-slate-400">{latest?.date}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">Period change</div>
              <div className={`text-2xl font-bold font-mono ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {change >= 0 ? '+' : ''}{formatValue(change, indicator)}
              </div>
              <div className="text-xs text-slate-400">{changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">Data points</div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {series.data.length}
              </div>
              <div className="text-xs text-slate-400">observations</div>
            </div>
          </div>

          {/* Chart */}
          <div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={series.data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008751" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#008751" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
                <XAxis
                  dataKey="date"
                  tickFormatter={v => { try { return format(parseISO(v), 'MMM yy') } catch { return v } }}
                  tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={55} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-2 shadow-lg text-xs">
                        <div className="text-slate-400 mb-1">{formatDate(label as string)}</div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatValue(payload[0].value as number, indicator)} {indicator.units}
                        </div>
                      </div>
                    )
                  }}
                />
                {events.map(e => (
                  <ReferenceLine key={e.id} x={e.date} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} />
                ))}
                <Area type="monotone" dataKey="value" stroke="#008751" strokeWidth={2} fill="url(#grad)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Heatmap */}
          {(indicator.frequency === 'monthly' || indicator.frequency === 'quarterly') && (
            <HeatmapChart indicatorId={indicatorId} dateRange={dateRange} />
          )}

          {/* Narrative */}
          {narrative && (
            <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <FileText className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">Analysis</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{narrative}</p>
            </div>
          )}

          {/* Data table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Raw Data</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-brand-700 text-white hover:bg-brand-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download CSV
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-60 rounded-xl border border-slate-200 dark:border-slate-700 scrollbar-thin">
              <table className="w-full text-sm" role="table" aria-label={`${indicator.name} data table`}>
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{indicator.units}</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {[...series.data].reverse().map((p, i, arr) => {
                    const prevVal = arr[i + 1]?.value
                    const ch = prevVal !== undefined ? p.value - prevVal : null
                    return (
                      <tr key={p.date} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-300 font-mono text-xs">{formatDate(p.date)}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs font-semibold text-slate-900 dark:text-white">
                          {formatValue(p.value, indicator)}
                        </td>
                        <td className={`px-4 py-2 text-right font-mono text-xs ${ch === null ? 'text-slate-400' : ch >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {ch !== null ? `${ch >= 0 ? '+' : ''}${formatValue(ch, indicator)}` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Source */}
          <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Source:</span>
            <a
              href={indicator.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              {indicator.source} <ExternalLink className="w-3 h-3" />
            </a>
            <span>· Updated: {indicator.updateFrequency}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
