import { INDICATORS } from './indicators'
import { getTimeSeries } from './timeseries'

export function getAllData(dateRange: { start: string; end: string }) {
  const rows: Array<Record<string, string | number>> = []
  INDICATORS.forEach(ind => {
    const series = getTimeSeries(ind.id, dateRange.start, dateRange.end)
    series.data.forEach(p => {
      rows.push({
        indicator_id: ind.id,
        indicator_name: ind.name,
        category: ind.category,
        date: p.date,
        value: p.value,
        units: ind.units,
        frequency: ind.frequency,
        source: ind.source,
      })
    })
  })
  return rows
}
