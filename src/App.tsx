import { useState } from 'react'
import clsx from 'clsx'
import { ArrowLeftRight, BarChart3, Download, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartTooltip, Legend, ResponsiveContainer
} from 'recharts'
import { format, parseISO } from 'date-fns'
import Header from './components/layout/Header'
import KpiRow from './components/kpi/KpiRow'
import FilterBar from './components/filters/FilterBar'
import TimeSeriesChart from './components/charts/TimeSeriesChart'
import IndicatorSelector from './components/charts/IndicatorSelector'
import CorrelationChart from './components/charts/CorrelationChart'
import AlertsPanel from './components/charts/AlertsPanel'
import EventsTimeline from './components/charts/EventsTimeline'
import DrilldownModal from './components/modals/DrilldownModal'
import { useDashboard } from './hooks/useDashboard'
import { INDICATORS, INDICATOR_MAP } from './data/indicators'
import { getTimeSeries } from './data/timeseries'
import { downloadCSV } from './utils/format'
import { getAllData } from './data/export'

type Tab = 'overview' | 'compare' | 'correlation'

export default function App() {
  const dash = useDashboard()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [corrX, setCorrX] = useState('cpi_headline')
  const [corrY, setCorrY] = useState('fx_usd_ngn')

  const handleExportAll = () => {
    const data = getAllData(dash.dateRange)
    downloadCSV(data, `nigeria_economic_data_${dash.dateRange.start}_${dash.dateRange.end}.csv`)
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'compare', label: 'Compare', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'correlation', label: 'Correlation', icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className={clsx('min-h-screen bg-[--color-bg]', dash.highContrast && 'high-contrast')}>
      <Header
        darkMode={dash.darkMode}
        toggleDark={dash.toggleDark}
        highContrast={dash.highContrast}
        setHighContrast={dash.setHighContrast}
        activeAlerts={dash.activeAlerts}
      />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6" id="main-content">
        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Nigeria Economic Indicators
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time macroeconomic dashboard · Data as of March 2025
            </p>
          </div>
          <button
            onClick={handleExportAll}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-brand-700 text-white hover:bg-brand-800 transition-colors"
            aria-label="Export all data to CSV"
          >
            <Download className="w-4 h-4" /> Export All CSV
          </button>
        </div>

        {/* KPI Row */}
        <KpiRow
          summaries={dash.kpiSummaries}
          activeAlerts={dash.activeAlerts}
          onSelect={id => dash.setDrilldownId(id)}
        />

        {/* Filters */}
        <FilterBar
          presetRanges={dash.presetRanges}
          selectedPreset={dash.selectedPreset}
          onPresetSelect={dash.selectPreset}
          dateRange={dash.dateRange}
          onDateChange={dash.setDateRange}
          frequency={dash.frequency}
          onFrequencyChange={dash.setFrequency}
          activeCategory={dash.activeCategory}
          onCategoryChange={dash.setActiveCategory}
          showEvents={dash.showEvents}
          onToggleEvents={() => dash.setShowEvents((v: boolean) => !v)}
        />

        {/* Tab bar */}
        <div className="flex items-center gap-1 mb-4 border-b border-slate-200 dark:border-slate-700" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'border-brand-700 text-brand-700 dark:border-brand-400 dark:text-brand-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              )}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div className="xl:col-span-3 space-y-4">
              <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Time Series
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      {dash.selectedIndicators
                        .map((id: string) => INDICATORS.find(i => i.id === id)?.shortName)
                        .join(', ')}
                    </span>
                  </h2>
                  <button
                    onClick={() => {
                      (dash.mainSeriesData as Array<{
                        id: string
                        indicator: { name: string; units: string }
                        series: { data: { date: string; value: number }[] }
                      }>).forEach(s => {
                        downloadCSV(
                          s.series.data.map(p => ({
                            indicator: s.indicator.name,
                            date: p.date,
                            value: p.value,
                            units: s.indicator.units,
                          })),
                          `${s.id}_chart.csv`
                        )
                      })
                    }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Download className="w-3 h-3" /> CSV
                  </button>
                </div>
                <TimeSeriesChart
                  series={dash.mainSeriesData}
                  showEvents={dash.showEvents}
                  dateRange={dash.dateRange}
                />
              </div>
            </div>
            <div className="space-y-4">
              <IndicatorSelector
                indicators={dash.filteredIndicators}
                selected={dash.selectedIndicators}
                onToggle={dash.toggleIndicator}
                maxSelect={4}
                label="Chart Indicators"
              />
              <AlertsPanel alerts={dash.alerts} onToggle={dash.toggleAlert} />
              <EventsTimeline dateRange={dash.dateRange} />
            </div>
          </div>
        )}

        {/* COMPARE TAB */}
        {activeTab === 'compare' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div className="xl:col-span-3 space-y-4">
              <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                  Multi-Indicator Comparison
                </h2>
                <TimeSeriesChart
                  series={dash.mainSeriesData}
                  showEvents={dash.showEvents}
                  dateRange={dash.dateRange}
                />
              </div>
              <TradeCompositionChart dateRange={dash.dateRange} />
            </div>
            <div className="space-y-4">
              <IndicatorSelector
                indicators={INDICATORS}
                selected={dash.selectedIndicators}
                onToggle={dash.toggleIndicator}
                maxSelect={4}
                label="Compare up to 4 Indicators"
              />
              <EventsTimeline dateRange={dash.dateRange} />
            </div>
          </div>
        )}

        {/* CORRELATION TAB */}
        {activeTab === 'correlation' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Scatter Plot & Regression
              </h2>
              <div className="flex flex-wrap gap-3 mb-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">X Axis</label>
                  <select
                    value={corrX}
                    onChange={e => setCorrX(e.target.value)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    aria-label="X axis indicator"
                  >
                    {INDICATORS.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Y Axis</label>
                  <select
                    value={corrY}
                    onChange={e => setCorrY(e.target.value)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    aria-label="Y axis indicator"
                  >
                    {INDICATORS.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <CorrelationChart xId={corrX} yId={corrY} dateRange={dash.dateRange} />
            <CorrelationMatrix dateRange={dash.dateRange} />
          </div>
        )}
      </main>

      {/* Drilldown Modal */}
      {dash.drilldownId && (
        <DrilldownModal
          indicatorId={dash.drilldownId}
          dateRange={dash.dateRange}
          onClose={() => dash.setDrilldownId(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 mt-10 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>
          Nigeria Economic Dashboard · Data sourced from NBS, CBN, World Bank, NGX ·
          For informational purposes only ·{' '}
          <span className="text-brand-700 dark:text-brand-500">Built with React + Recharts</span>
        </p>
        <p className="mt-1">
          Figures are illustrative; always verify against official sources before use in policy or investment decisions.
        </p>
      </footer>
    </div>
  )
}

// ─── Trade composition bar chart ────────────────────────────────────────────
function TradeCompositionChart({ dateRange }: { dateRange: { start: string; end: string } }) {
  const exportsData = getTimeSeries('trade_exports', dateRange.start, dateRange.end).data
  const importsData = getTimeSeries('trade_imports', dateRange.start, dateRange.end).data
  const chartData = exportsData.map((e, i) => ({
    date: e.date,
    Exports: Math.round(e.value),
    Imports: Math.round(importsData[i]?.value ?? 0),
  }))

  return (
    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
        Trade Composition (₦ Billion)
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => {
              try { return format(parseISO(v), 'MMM yy') } catch { return v }
            }}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={55} />
          <RechartTooltip />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="Exports" fill="#008751" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Imports" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Correlation matrix ──────────────────────────────────────────────────────
function CorrelationMatrix({ dateRange }: { dateRange: { start: string; end: string } }) {
  const PAIRS: [string, string][] = [
    ['cpi_headline', 'fx_usd_ngn'],
    ['cpi_headline', 'mpr'],
    ['oil_price', 'fx_reserves'],
    ['gdp_real_growth', 'oil_production'],
    ['mpr', 'ngx_asi'],
    ['fx_usd_ngn', 'ngx_asi'],
  ]
  return (
    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
        Correlation Matrix — Key Pairs
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PAIRS.map(([xId, yId]) => (
          <MiniCorr key={`${xId}-${yId}`} xId={xId} yId={yId} dateRange={dateRange} />
        ))}
      </div>
    </div>
  )
}

function MiniCorr({
  xId, yId, dateRange,
}: {
  xId: string; yId: string; dateRange: { start: string; end: string }
}) {
  const xInd = INDICATOR_MAP[xId]
  const yInd = INDICATOR_MAP[yId]
  const xS = getTimeSeries(xId, dateRange.start, dateRange.end)
  const yS = getTimeSeries(yId, dateRange.start, dateRange.end)
  const xMap = new Map(xS.data.map(p => [p.date.slice(0, 7), p.value]))
  const points: { x: number; y: number }[] = []
  yS.data.forEach(p => {
    const month = p.date.slice(0, 7)
    if (xMap.has(month)) points.push({ x: xMap.get(month)!, y: p.value })
  })
  if (points.length < 3 || !xInd || !yInd) return null
  const n = points.length
  const meanX = points.reduce((s, p) => s + p.x, 0) / n
  const meanY = points.reduce((s, p) => s + p.y, 0) / n
  const num = points.reduce((s, p) => s + (p.x - meanX) * (p.y - meanY), 0)
  const denom = Math.sqrt(
    points.reduce((s, p) => s + (p.x - meanX) ** 2, 0) *
    points.reduce((s, p) => s + (p.y - meanY) ** 2, 0)
  )
  const r = denom === 0 ? 0 : num / denom
  const absR = Math.abs(r)
  const color = r > 0
    ? `rgba(0,135,81,${0.15 + absR * 0.55})`
    : `rgba(239,68,68,${0.15 + absR * 0.55})`

  return (
    <div
      className="rounded-lg p-3 border border-slate-100 dark:border-slate-700"
      style={{ backgroundColor: color }}
    >
      <div className="text-xs font-semibold text-slate-800 dark:text-white truncate">
        {xInd.shortName} × {yInd.shortName}
      </div>
      <div className="text-2xl font-bold font-mono mt-1 text-slate-900 dark:text-white">
        {r.toFixed(2)}
      </div>
      <div className="text-xs text-slate-600 dark:text-slate-300">
        {n} obs · {r > 0.5 ? 'Strong +' : r < -0.5 ? 'Strong −' : r > 0 ? 'Weak +' : 'Weak −'}
      </div>
    </div>
  )
}
