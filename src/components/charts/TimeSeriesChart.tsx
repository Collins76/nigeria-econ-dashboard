import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush,
} from 'recharts'
import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import type { TimeSeries } from '../../types'
import { INDICATORS } from '../../data/indicators'
import { EVENTS } from '../../data/events'
import { CHART_COLORS, formatValue } from '../../utils/format'

interface SeriesData {
  id: string
  series: TimeSeries
}

interface Props {
  series: SeriesData[]
  showEvents: boolean
  dateRange: { start: string; end: string }
}

function tickFormatter(val: string) {
  try { return format(parseISO(val), 'MMM yy') } catch { return val }
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{value: number; name: string; color: string; dataKey: string}>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl p-3 min-w-[160px]">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
        {label ? (() => { try { return format(parseISO(label), 'dd MMM yyyy') } catch { return label } })() : ''}
      </p>
      {payload.map(entry => {
        const indicator = INDICATORS.find(i => i.id === entry.dataKey)
        return (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-600 dark:text-slate-300 text-xs truncate max-w-[100px]">
                {indicator?.shortName ?? entry.name}
              </span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
              {indicator ? formatValue(entry.value, indicator) : entry.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function TimeSeriesChart({ series, showEvents, dateRange }: Props) {
  // Merge all series into one data array keyed by date
  const chartData = useMemo(() => {
    const dateMap = new Map<string, Record<string, number>>()
    series.forEach(({ id, series: ts }) => {
      ts.data.forEach(({ date, value }) => {
        if (!dateMap.has(date)) dateMap.set(date, { date: date as unknown as number })
        dateMap.get(date)![id] = value
      })
    })
    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }))
  }, [series])

  // Filter events for the visible range
  const visibleEvents = useMemo(() =>
    showEvents
      ? EVENTS.filter(e => e.date >= dateRange.start && e.date <= dateRange.end)
      : [],
    [showEvents, dateRange])

  if (!series.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500 text-sm">
        Select up to 4 indicators to visualise
      </div>
    )
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
          <XAxis
            dataKey="date"
            tickFormatter={tickFormatter}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          {series.map((s, idx) => (
            <YAxis
              key={s.id}
              yAxisId={idx === 0 ? 'left' : 'right'}
              orientation={idx === 0 ? 'left' : 'right'}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              width={55}
            />
          ))}
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            formatter={(value: string) => {
              const ind = INDICATORS.find(i => i.id === value)
              return ind?.shortName ?? value
            }}
          />

          {/* Event reference lines */}
          {visibleEvents.map(event => (
            <ReferenceLine
              key={event.id}
              x={event.date}
              yAxisId="left"
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: event.title.slice(0, 20),
                fontSize: 9,
                fill: '#f59e0b',
                angle: -90,
                dy: 40,
              }}
            />
          ))}

          {series.map((s, idx) => {
            const color = CHART_COLORS[idx % CHART_COLORS.length]
            return idx === 0 ? (
              <Area
                key={s.id}
                type="monotone"
                dataKey={s.id}
                yAxisId="left"
                stroke={color}
                fill={color}
                fillOpacity={0.08}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, fill: color }}
              />
            ) : (
              <Line
                key={s.id}
                type="monotone"
                dataKey={s.id}
                yAxisId="right"
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, fill: color }}
              />
            )
          })}

          {/* Brush for zoom */}
          <Brush
            dataKey="date"
            height={20}
            stroke="#e2e8f0"
            fill="#f8fafc"
            tickFormatter={tickFormatter}
            travellerWidth={8}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
