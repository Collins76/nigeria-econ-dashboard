import { Moon, Sun, Contrast, Bell, Menu, X } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import type { AlertConfig } from '../../types'

type NavTab = 'overview' | 'compare' | 'correlation'

const NAV_ITEMS: { label: string; tab: NavTab }[] = [
  { label: 'Overview', tab: 'overview' },
  { label: 'Compare', tab: 'compare' },
  { label: 'Correlation', tab: 'correlation' },
]

interface Props {
  darkMode: boolean
  toggleDark: () => void
  highContrast: boolean
  setHighContrast: (v: boolean) => void
  activeAlerts: AlertConfig[]
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
}

export default function Header({
  darkMode, toggleDark,
  highContrast, setHighContrast,
  activeAlerts,
  activeTab, onTabChange,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm"
      role="banner"
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4 flex-shrink-0">
          <div className="w-7 h-7 rounded-md overflow-hidden flex flex-col">
            <div className="flex-1 bg-[#008751]" />
            <div className="flex-1 bg-white dark:bg-slate-200" />
            <div className="flex-1 bg-[#008751]" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight text-slate-900 dark:text-white">Nigeria</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight font-medium">Economic Dashboard</div>
          </div>
        </div>

        {/* Nav links (desktop) — wired to tab state */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium" aria-label="Main navigation" role="tablist">
          {NAV_ITEMS.map(({ label, tab }) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => onTabChange(tab)}
              className={clsx(
                'px-3 py-1.5 rounded-md transition-colors font-medium',
                activeTab === tab
                  ? 'bg-brand-700 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Last updated */}
        <span className="hidden sm:block text-xs text-slate-400 dark:text-slate-500">
          Last updated: Mar 2025
        </span>

        {/* Alerts bell */}
        <div className="relative">
          <button
            onClick={() => setAlertsOpen(o => !o)}
            className={clsx(
              'relative p-2 rounded-md transition-colors',
              activeAlerts.length > 0
                ? 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            )}
            aria-label={`${activeAlerts.length} active alerts`}
            aria-expanded={alertsOpen}
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
                {activeAlerts.length}
              </span>
            )}
          </button>
          {alertsOpen && (
            <>
              {/* Click-outside backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setAlertsOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-3">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Active Alerts</div>
                {activeAlerts.length === 0 ? (
                  <p className="text-sm text-slate-500 py-2">No active threshold alerts.</p>
                ) : (
                  <div className="space-y-2">
                    {activeAlerts.map(a => (
                      <div key={a.indicatorId} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <span className="text-red-500 mt-0.5">⚠</span>
                        <div>
                          <div className="text-xs font-semibold text-red-700 dark:text-red-300">{a.label}</div>
                          <div className="text-xs text-red-500 dark:text-red-400">Threshold {a.direction} {a.threshold}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* High contrast */}
        <button
          onClick={() => setHighContrast(!highContrast)}
          className={clsx(
            'p-2 rounded-md transition-colors',
            highContrast
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          )}
          aria-label="Toggle high contrast mode"
          aria-pressed={highContrast}
        >
          <Contrast className="w-4 h-4" />
        </button>

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-slate-200 dark:border-slate-700 px-4 py-2" aria-label="Mobile navigation">
          {NAV_ITEMS.map(({ label, tab }) => (
            <button
              key={tab}
              onClick={() => { onTabChange(tab); setMenuOpen(false) }}
              className={clsx(
                'block w-full text-left py-2 px-2 rounded-md text-sm transition-colors',
                activeTab === tab
                  ? 'text-brand-700 dark:text-brand-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}
