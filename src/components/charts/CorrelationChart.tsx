import { useMemo } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts'
import { getTimeSeries } from '../../data/timeseries'
import { INDICATOR_MAP } from '../../data/indicators'
import { formatValue } from '../../utils/format'

interface Props {
  xId: string
  yId: string
  dateRange: { start: string; end: string }
}

function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length
  if (n < 3) return null
  const sumX = points.reduce((s, p) => s + p.x, 0)
  const sumY = points.reduce((s, p) => s + p.y, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  const meanY = sumY / n
  const ssTot = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0)
  const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0)
  const r2 = 1 - ssRes / ssTot
  return { slope, intercept, r2, r: Math.sqrt(Math.abs(r2)) * (slope >= 0 ? 1 : -1) }
}

export default function CorrelationChart({ xId, yId, dateRange }: Props) {
  const xIndicator = INDICATOR_MAP[xId]
  const yIndicator = INDICATOR_MAP[yId]

  const { points, regression } = useMemo(() => {
    const xSeries = getTimeSeries(xId, dateRange.start, dateRange.end)
    const ySeries = getTimeSeries(yId, dateRange.start, dateRange.end)
    const xMap = new Map(xSeries.data.map(p => [p.date.slice(0, 7), p.value]))
    const yMap = new Map(ySeries.data.map(p => [p.date.slice(0, 7), p.value]))
    const pts: { x: number; y: number; date: string }[] = []
    xMap.forEach((xVal, month) => {
      if (yMap.has(month)) pts.push({ x: xVal, y: yMap.get(month)!, date: month })
    })
    const reg = linearRegression(pts)
    // regression line points
    if (reg && pts.length > 0) {
      const xMin = Math.min(...pts.map(p => p.x))
      const xMax = Math.max(...pts.map(p => p.x))
      const regLine = [
        { x: xMin, y: reg.slope * xMin + reg.intercept },
        { x: xMax, y: reg.slope * xMax + reg.intercept },
      ]
      return { points: pts, regression: { ...reg, line: regLine } }
    }
    return { points: pts, regression: null }
  }, [xId, yId, dateRange])

  if (!xIndicator || !yIndicator) return null

  return (
    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Correlation: {xIndicator.shortName} vs {yIndicator.shortName}
          </h3>
          {regression && (
            <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>r = <strong className="text-slate-700 dark:text-slate-300">{regression.r.toFixed(3)}</strong></span>
              <span>R² = <strong className="text-slate-700 dark:text-slate-300">{regression.r2.toFixed(3)}</strong></span>
              <span>{points.length} observations</span>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 5, right: 20, bottom: 30, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
          <XAxis
            type="number"
            dataKey="x"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          >
            <Label value={`${xIndicator.shortName} (${xIndicator.units})`} position="insideBottom" offset={-15} fontSize={11} fill="#94a3b8" />
          </XAxis>
          <YAxis
            type="number"
            dataKey="y"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          >
            <Label value={`${yIndicator.shortName} (${yIndicator.units})`} angle={-90} position="insideLeft" offset={15} fontSize={11} fill="#94a3b8" />
          </YAxis>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as { x: number; y: number; date: string }
              return (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-2 shadow-lg text-xs">
                  <div className="text-slate-400 mb-1">{d.date}</div>
                  <div>{xIndicator.shortName}: <strong>{formatValue(d.x, xIndicator)}</strong></div>
                  <div>{yIndicator.shortName}: <strong>{formatValue(d.y, yIndicator)}</strong></div>
                </div>
              )
            }}
          />
          <Scatter data={points} fill="#008751" fillOpacity={0.6} />
          {regression && (
            <Scatter data={regression.line} fill="#ef4444" line={{ stroke: '#ef4444', strokeWidth: 2 }} shape={() => null as unknown as React.ReactElement} />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
