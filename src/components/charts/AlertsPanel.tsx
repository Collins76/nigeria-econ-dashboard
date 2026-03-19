import { Bell, BellOff } from 'lucide-react'
import clsx from 'clsx'
import type { AlertConfig } from '../../types'
import { INDICATOR_MAP } from '../../data/indicators'
import { getLatestValue } from '../../data/timeseries'
import { formatValue } from '../../utils/format'

interface Props {
  alerts: AlertConfig[]
  onToggle: (id: string) => void
}

export default function AlertsPanel({ alerts, onToggle }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
        <Bell className="w-4 h-4 text-amber-500" /> Threshold Alerts
      </h3>
      <div className="space-y-2">
        {alerts.map(alert => {
          const indicator = INDICATOR_MAP[alert.indicatorId]
          const latest = getLatestValue(alert.indicatorId)
          const triggered = latest
            ? alert.direction === 'above'
              ? latest.value > alert.threshold
              : latest.value < alert.threshold
            : false

          return (
            <div
              key={alert.indicatorId}
              className={clsx(
                'flex items-center gap-3 p-2.5 rounded-lg border text-xs',
                triggered && alert.enabled
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
              )}
            >
              <button
                onClick={() => onToggle(alert.indicatorId)}
                className={clsx(
                  'flex-shrink-0 transition-colors',
                  alert.enabled
                    ? triggered ? 'text-red-500' : 'text-amber-500'
                    : 'text-slate-300 dark:text-slate-600'
                )}
                aria-label={`${alert.enabled ? 'Disable' : 'Enable'} alert: ${alert.label}`}
                aria-pressed={alert.enabled}
              >
                {alert.enabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-700 dark:text-slate-200 truncate">{alert.label}</div>
                {indicator && latest && (
                  <div className={clsx('mt-0.5', triggered && alert.enabled ? 'text-red-500 font-semibold' : 'text-slate-400')}>
                    Current: {formatValue(latest.value, indicator)} {indicator.units}
                    {triggered && alert.enabled && ' ⚠ Triggered'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">Click bell icon to enable/disable alerts</p>
    </div>
  )
}
