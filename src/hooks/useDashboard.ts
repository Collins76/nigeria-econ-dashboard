import { useState, useMemo, useCallback } from 'react'
import { subYears, subMonths, format } from 'date-fns'
import { INDICATORS } from '../data/indicators'
import { getTimeSeries, getLatestValue, getPreviousValue, getSparkline } from '../data/timeseries'
import { NARRATIVES } from '../data/narratives'
import type { KpiSummary, DateRange, AlertConfig, Frequency } from '../types'

const PRESET_RANGES: DateRange[] = [
  { label: '3M', start: format(subMonths(new Date(), 3), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') },
  { label: '6M', start: format(subMonths(new Date(), 6), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') },
  { label: '1Y', start: format(subYears(new Date(), 1), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') },
  { label: '3Y', start: format(subYears(new Date(), 3), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') },
  { label: '5Y', start: format(subYears(new Date(), 5), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') },
  { label: '10Y', start: format(subYears(new Date(), 10), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') },
  { label: 'All', start: '2000-01-01', end: format(new Date(), 'yyyy-MM-dd') },
]

// KPI row indicators (pinned top)
const KPI_IDS = ['cpi_headline', 'fx_usd_ngn', 'mpr', 'gdp_real_growth', 'fx_reserves', 'oil_production', 'ngx_asi', 'pmi_composite']

const DEFAULT_ALERTS: AlertConfig[] = [
  { indicatorId: 'cpi_headline', threshold: 20, direction: 'above', label: 'Inflation above 20%', enabled: true },
  { indicatorId: 'fx_usd_ngn', threshold: 1600, direction: 'above', label: 'FX above ₦1600/$', enabled: true },
  { indicatorId: 'fx_reserves', threshold: 30, direction: 'below', label: 'Reserves below $30bn', enabled: true },
  { indicatorId: 'oil_production', threshold: 1200, direction: 'below', label: 'Oil production below 1200 kbd', enabled: true },
  { indicatorId: 'pmi_composite', threshold: 50, direction: 'below', label: 'PMI in contraction', enabled: true },
]

export function useDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>(PRESET_RANGES[3]) // 3Y default
  const [selectedPreset, setSelectedPreset] = useState<string>('3Y')
  const [frequency, setFrequency] = useState<Frequency>('monthly')
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['cpi_headline', 'fx_usd_ngn'])
  const [compareIndicators, setCompareIndicators] = useState<string[]>([])
  const [darkMode, setDarkMode] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [drilldownId, setDrilldownId] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<AlertConfig[]>(DEFAULT_ALERTS)
  const [showCorrelation, setShowCorrelation] = useState(false)
  const [showEvents, setShowEvents] = useState(true)

  const presetRanges = PRESET_RANGES

  const selectPreset = useCallback((label: string) => {
    const range = PRESET_RANGES.find(r => r.label === label)
    if (range) { setDateRange(range); setSelectedPreset(label) }
  }, [])

  const kpiSummaries: KpiSummary[] = useMemo(() =>
    KPI_IDS.map(id => {
      const indicator = INDICATORS.find(i => i.id === id)!
      const latest = getLatestValue(id)
      const previous = getPreviousValue(id, 1)
      const latestValue = latest?.value ?? 0
      const previousValue = previous?.value ?? 0
      const periodChange = latestValue - previousValue
      const periodChangePct = previousValue !== 0 ? (periodChange / Math.abs(previousValue)) * 100 : 0
      const sparkline = getSparkline(id, 12)
      const trend = Math.abs(periodChange) < 0.01 ? 'flat' : periodChange > 0 ? 'up' : 'down'
      return {
        indicator,
        latestValue,
        previousValue,
        periodChange,
        periodChangePct,
        sparkline,
        lastUpdated: '2025-03-01',
        trend,
        narrative: NARRATIVES[id] ?? '',
      }
    }), [])

  const mainSeriesData = useMemo(() =>
    selectedIndicators.map(id => ({
      id,
      indicator: INDICATORS.find(i => i.id === id)!,
      series: getTimeSeries(id, dateRange.start, dateRange.end),
    })), [selectedIndicators, dateRange])

  const filteredIndicators = useMemo(() =>
    activeCategory ? INDICATORS.filter(i => i.category === activeCategory) : INDICATORS,
    [activeCategory])

  const activeAlerts = useMemo(() =>
    alerts.filter(a => {
      if (!a.enabled) return false
      const latest = getLatestValue(a.indicatorId)
      if (!latest) return false
      return a.direction === 'above' ? latest.value > a.threshold : latest.value < a.threshold
    }), [alerts])

  const toggleIndicator = useCallback((id: string) => {
    setSelectedIndicators(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    )
  }, [])

  const toggleCompare = useCallback((id: string) => {
    setCompareIndicators(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }, [])

  const toggleDark = useCallback(() => {
    setDarkMode(d => {
      const next = !d
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }, [])

  const toggleAlert = useCallback((indicatorId: string) => {
    setAlerts(prev => prev.map(a => a.indicatorId === indicatorId ? { ...a, enabled: !a.enabled } : a))
  }, [])

  return {
    dateRange, setDateRange, presetRanges, selectedPreset, selectPreset,
    frequency, setFrequency,
    selectedIndicators, toggleIndicator, setSelectedIndicators,
    compareIndicators, toggleCompare,
    darkMode, toggleDark,
    highContrast, setHighContrast,
    activeCategory, setActiveCategory,
    drilldownId, setDrilldownId,
    alerts, activeAlerts, toggleAlert,
    showCorrelation, setShowCorrelation,
    showEvents, setShowEvents,
    kpiSummaries, mainSeriesData, filteredIndicators,
  }
}
