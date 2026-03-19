import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { getTimeSeries } from '../../data/timeseries'
import { INDICATOR_MAP } from '../../data/indicators'

interface Props {
  indicatorId: string
  dateRange: { start: string; end: string }
}

function getColor(value: number, min: number, max: number, positiveIsGood: boolean): string {
  const ratio = max === min ? 0.5 : (value - min) / (max - min)
  if (positiveIsGood) {
    // green (high) to red (low)
    const r = Math.round(255 * (1 - ratio))
    const g = Math.round(170 * ratio + 20)
    return `rgb(${r},${g},50)`
  } else {
    // red (high) to green (low)
    const r = Math.round(255 * ratio)
    const g = Math.round(170 * (1 - ratio) + 20)
    return `rgb(${r},${g},50)`
  }
}

export default function HeatmapChart({ indicatorId, dateRange }: Props) {
  const indicator = INDICATOR_MAP[indicatorId]
  const series = getTimeSeries(indicatorId, dateRange.start, dateRange.end)

  const grid = useMemo(() => {
    // Group by year → month
    const byYear = new Map<number, Map<number, number>>()
    series.data.forEach(p => {
      const d = parseISO(p.date)
      const yr = d.getFullYear()
      const mo = d.getMonth()
      if (!byYear.has(yr)) byYear.set(yr, new Map())
      byYear.get(yr)!.set(mo, p.value)
    })
    return byYear
  }, [series])

  const allValues = series.data.map(p => p.value)
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const years = Array.from(grid.keys()).sort()
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  if (!indicator) return null

  return (
    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 overflow-x-auto">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
        Monthly Heatmap — {indicator.name} ({indicator.units})
      </h3>
      <div className="min-w-[600px]">
        <div className="grid gap-1" style={{ gridTemplateColumns: `60px repeat(12, 1fr)` }}>
          {/* Header */}
          <div />
          {months.map(m => (
            <div key={m} className="text-center text-xs text-slate-400 font-medium pb-1">{m}</div>
          ))}
          {/* Rows */}
          {years.map(yr => (
            <>
              <div key={`yr-${yr}`} className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center">{yr}</div>
              {Array.from({ length: 12 }, (_, mo) => {
                const val = grid.get(yr)?.get(mo)
                return (
                  <div
                    key={`${yr}-${mo}`}
                    className="rounded-sm aspect-square flex items-center justify-center text-[9px] font-bold text-white relative group cursor-default"
                    style={{
                      backgroundColor: val !== undefined
                        ? getColor(val, min, max, indicator.positiveDirection === 'up')
                        : '#e2e8f0',
                      opacity: val !== undefined ? 1 : 0.3,
                    }}
                    title={val !== undefined ? `${months[mo]} ${yr}: ${val.toFixed(2)}` : 'No data'}
                    aria-label={val !== undefined ? `${months[mo]} ${yr}: ${val.toFixed(2)} ${indicator.units}` : `${months[mo]} ${yr}: no data`}
                  >
                    {val !== undefined && <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[9px] bg-slate-900 text-white rounded px-1 py-0.5 whitespace-nowrap z-10">{val.toFixed(1)}</span>}
                  </div>
                )
              })}
            </>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-slate-500">Low</span>
          <div className="h-2 flex-1 rounded" style={{
            background: indicator.positiveDirection === 'up'
              ? 'linear-gradient(to right, rgb(255,20,50), rgb(0,170,50))'
              : 'linear-gradient(to right, rgb(0,170,50), rgb(255,20,50))'
          }} />
          <span className="text-xs text-slate-500">High</span>
          <span className="text-xs text-slate-400 ml-2">Range: {min.toFixed(1)} – {max.toFixed(1)} {indicator.units}</span>
        </div>
      </div>
    </div>
  )
}
