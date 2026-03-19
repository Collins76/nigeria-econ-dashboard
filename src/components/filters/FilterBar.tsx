import { Calendar, BarChart2, Layers, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import type { DateRange, Frequency } from '../../types'
import { CATEGORIES } from '../../data/indicators'

interface Props {
  presetRanges: DateRange[]
  selectedPreset: string
  onPresetSelect: (label: string) => void
  dateRange: DateRange
  onDateChange: (range: DateRange) => void
  frequency: Frequency
  onFrequencyChange: (f: Frequency) => void
  activeCategory: string | null
  onCategoryChange: (c: string | null) => void
  showEvents: boolean
  onToggleEvents: () => void
}

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
]

export default function FilterBar({
  presetRanges, selectedPreset, onPresetSelect,
  dateRange, onDateChange,
  frequency, onFrequencyChange,
  activeCategory, onCategoryChange,
  showEvents, onToggleEvents,
}: Props) {
  return (
    <div
      className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 mb-4 space-y-3"
      role="region"
      aria-label="Dashboard filters"
    >
      <div className="flex flex-wrap gap-3 items-start">
        {/* Date presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            <Calendar className="w-3 h-3 inline mr-1" />Period
          </label>
          <div className="flex items-center gap-1 flex-wrap">
            {presetRanges.map(r => (
              <button
                key={r.label}
                onClick={() => onPresetSelect(r.label)}
                className={clsx(
                  'px-2.5 py-1 text-xs font-semibold rounded-md transition-colors',
                  selectedPreset === r.label
                    ? 'bg-brand-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                )}
                aria-pressed={selectedPreset === r.label}
              >
                {r.label}
              </button>
            ))}
            {/* Custom date inputs */}
            <div className="flex items-center gap-1 ml-1">
              <input
                type="date"
                value={dateRange.start}
                onChange={e => onDateChange({ ...dateRange, start: e.target.value, label: 'Custom' })}
                className="text-xs px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                aria-label="Start date"
              />
              <span className="text-slate-400 text-xs">→</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => onDateChange({ ...dateRange, end: e.target.value, label: 'Custom' })}
                className="text-xs px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                aria-label="End date"
              />
            </div>
          </div>
        </div>

        {/* Frequency toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            <BarChart2 className="w-3 h-3 inline mr-1" />Frequency
          </label>
          <div className="flex items-center gap-1">
            {FREQUENCIES.map(f => (
              <button
                key={f.value}
                onClick={() => onFrequencyChange(f.value)}
                className={clsx(
                  'px-2.5 py-1 text-xs font-semibold rounded-md transition-colors',
                  frequency === f.value
                    ? 'bg-brand-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                )}
                aria-pressed={frequency === f.value}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Event overlay toggle */}
        <div className="flex flex-col">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            <Layers className="w-3 h-3 inline mr-1" />Overlays
          </label>
          <button
            onClick={onToggleEvents}
            className={clsx(
              'px-2.5 py-1 text-xs font-semibold rounded-md transition-colors',
              showEvents
                ? 'bg-brand-700 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            )}
            aria-pressed={showEvents}
          >
            Events
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onCategoryChange(null)}
            className={clsx(
              'px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors',
              activeCategory === null
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-transparent'
                : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-400'
            )}
          >
            All
          </button>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => onCategoryChange(key === activeCategory ? null : key)}
              className={clsx(
                'px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors',
                activeCategory === key
                  ? 'text-white border-transparent'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-400'
              )}
              style={activeCategory === key ? { backgroundColor: cat.color } : {}}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
