import KpiCard from './KpiCard'
import type { KpiSummary, AlertConfig } from '../../types'

interface Props {
  summaries: KpiSummary[]
  activeAlerts: AlertConfig[]
  onSelect: (id: string) => void
}

export default function KpiRow({ summaries, activeAlerts, onSelect }: Props) {
  const alertIds = new Set(activeAlerts.map(a => a.indicatorId))

  return (
    <section aria-labelledby="kpi-heading" className="mb-6">
      <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        {summaries.map(s => (
          <KpiCard
            key={s.indicator.id}
            summary={s}
            onClick={() => onSelect(s.indicator.id)}
            hasAlert={alertIds.has(s.indicator.id)}
          />
        ))}
      </div>
    </section>
  )
}
