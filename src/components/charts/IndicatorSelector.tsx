import { Search, CheckCircle2, Circle } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import type { Indicator } from '../../types'
import { CATEGORIES } from '../../data/indicators'
import { categoryColor } from '../../utils/format'

interface Props {
  indicators: Indicator[]
  selected: string[]
  onToggle: (id: string) => void
  maxSelect?: number
  label?: string
}

export default function IndicatorSelector({ indicators, selected, onToggle, maxSelect = 4, label = 'Select Indicators' }: Props) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? indicators.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.shortName.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase())
      )
    : indicators

  const grouped = Object.entries(CATEGORIES).map(([key, cat]) => ({
    key, cat,
    items: filtered.filter(i => i.category === key),
  })).filter(g => g.items.length > 0)

  return (
    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{label}</h3>
        <span className="text-xs text-slate-400">{selected.length}/{maxSelect} selected</span>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="search"
          placeholder="Search indicators…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
          aria-label="Search indicators"
        />
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin pr-1">
        {grouped.map(({ key, cat, items }) => (
          <div key={key}>
            <div className="text-[11px] font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1.5"
              style={{ color: cat.color }}
            >
              <span>{cat.emoji}</span> {cat.label}
            </div>
            <div className="space-y-1">
              {items.map(ind => {
                const isSelected = selected.includes(ind.id)
                const isDisabled = !isSelected && selected.length >= maxSelect
                return (
                  <button
                    key={ind.id}
                    onClick={() => !isDisabled && onToggle(ind.id)}
                    disabled={isDisabled}
                    className={clsx(
                      'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors text-xs',
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-900/30 border border-brand-300 dark:border-brand-700'
                        : isDisabled
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'
                    )}
                    aria-pressed={isSelected}
                    aria-disabled={isDisabled}
                  >
                    {isSelected
                      ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-brand-700 dark:text-brand-400" />
                      : <Circle className="w-3.5 h-3.5 flex-shrink-0 text-slate-300 dark:text-slate-600" />
                    }
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: categoryColor(ind.category) }}
                    />
                    <span className="flex-1 text-slate-700 dark:text-slate-200 font-medium truncate">{ind.shortName}</span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{ind.units}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
