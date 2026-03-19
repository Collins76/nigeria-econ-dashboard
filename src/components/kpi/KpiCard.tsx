import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Info, AlertTriangle, ExternalLink } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'
import type { KpiSummary } from '../../types'
import { formatValue, isPositiveChange } from '../../utils/format'

interface Props {
  summary: KpiSummary
  onClick: () => void
  hasAlert: boolean
}

export default function KpiCard({ summary, onClick, hasAlert }: Props) {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const { indicator, latestValue, periodChange, periodChangePct, sparkline, lastUpdated } = summary
  const positive = isPositiveChange(periodChange, indicator)
  const isFlat = Math.abs(periodChange) < 0.001

  const TrendIcon = isFlat ? Minus : periodChange > 0 ? TrendingUp : TrendingDown
  const changeColor = isFlat ? 'text-slate-500' : positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
  const sparkColor = isFlat ? '#94a3b8' : positive ? '#008751' : '#ef4444'

  return (
    <button
      onClick={onClick}
      className={clsx(
        'group relative flex flex-col p-4 rounded-xl border transition-all text-left',
        'bg-white dark:bg-slate-800/80',
        'hover:shadow-lg hover:-translate-y-0.5',
        hasAlert
          ? 'border-amber-400 dark:border-amber-500 ring-1 ring-amber-300 dark:ring-amber-600'
          : 'border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600',
      )}
      aria-label={`${indicator.name}: ${formatValue(latestValue, indicator)}. Click to view details.`}
    >
      {/* Alert badge */}
      {hasAlert && (
        <span className="absolute top-2 right-2 text-amber-500" aria-label="Threshold alert active">
          <AlertTriangle className="w-3.5 h-3.5" />
        </span>
      )}

      {/* Category dot */}
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: sparkColor }}
        />
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
          {indicator.shortName}
        </span>
        {/* Info tooltip */}
        <div className="relative ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); setTooltipOpen(o => !o) }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label={`Info about ${indicator.name}`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          {tooltipOpen && (
            <div
              className="absolute right-0 bottom-full mb-1 w-56 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg p-2.5 shadow-lg z-30"
              role="tooltip"
            >
              <p className="mb-1">{indicator.description}</p>
              <a
                href={indicator.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:underline"
                onClick={e => e.stopPropagation()}
              >
                {indicator.source} <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Big value */}
      <div
        className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1 font-mono"
        aria-label={`Current value: ${formatValue(latestValue, indicator)} ${indicator.units}`}
      >
        {formatValue(latestValue, indicator)}
      </div>
      <div className="text-xs text-slate-400 dark:text-slate-500 mb-3">{indicator.units}</div>

      {/* Sparkline */}
      <div className="h-10 mb-2" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkline}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={sparkColor}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Change row */}
      <div className={clsx('flex items-center gap-1 text-xs font-semibold', changeColor)}>
        <TrendIcon className="w-3.5 h-3.5" />
        <span>{periodChange >= 0 ? '+' : ''}{formatValue(periodChange, indicator)}</span>
        <span className="text-slate-400 dark:text-slate-500 font-normal">
          ({periodChangePct >= 0 ? '+' : ''}{periodChangePct.toFixed(1)}%)
        </span>
      </div>

      <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
        vs prior period · {lastUpdated}
      </div>
    </button>
  )
}
