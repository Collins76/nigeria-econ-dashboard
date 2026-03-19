import { Zap } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { EVENTS } from '../../data/events'
import type { EconomicEvent } from '../../types'

const TYPE_COLORS: Record<EconomicEvent['type'], string> = {
  policy: '#3b82f6',
  reform: '#008751',
  crisis: '#ef4444',
  report: '#8b5cf6',
  election: '#f59e0b',
}
const TYPE_LABELS: Record<EconomicEvent['type'], string> = {
  policy: 'Policy',
  reform: 'Reform',
  crisis: 'Crisis',
  report: 'Data Release',
  election: 'Election',
}

interface Props {
  dateRange: { start: string; end: string }
}

export default function EventsTimeline({ dateRange }: Props) {
  const events = EVENTS
    .filter(e => e.date >= dateRange.start && e.date <= dateRange.end)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12)

  return (
    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-500" /> Economic Events
      </h3>
      {events.length === 0 ? (
        <p className="text-xs text-slate-400">No events in selected period</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
          {events.map(e => (
            <div key={e.id} className="flex gap-3">
              <div
                className="w-1 rounded-full flex-shrink-0 mt-1 self-stretch"
                style={{ backgroundColor: TYPE_COLORS[e.type] }}
                aria-hidden
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: TYPE_COLORS[e.type] + '22', color: TYPE_COLORS[e.type] }}
                  >
                    {TYPE_LABELS[e.type]}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {format(parseISO(e.date), 'dd MMM yyyy')}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{e.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{e.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
