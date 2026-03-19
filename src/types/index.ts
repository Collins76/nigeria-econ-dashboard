export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
export type Category =
  | 'gdp'
  | 'inflation'
  | 'labour'
  | 'exchange'
  | 'interest'
  | 'trade'
  | 'fiscal'
  | 'external'
  | 'commodity'
  | 'markets'
  | 'leading'

export interface Indicator {
  id: string
  name: string
  shortName: string
  category: Category
  source: string
  sourceUrl: string
  frequency: Frequency
  units: string
  description: string
  updateFrequency: string
  positiveDirection: 'up' | 'down' // is increase good or bad?
  alertThreshold?: number
  alertDirection?: 'above' | 'below'
  format?: 'number' | 'percent' | 'currency' | 'rate'
}

export interface DataPoint {
  date: string // ISO date string
  value: number
}

export interface TimeSeries {
  indicatorId: string
  data: DataPoint[]
  lastUpdated: string
  provenance?: string
}

export interface EconomicEvent {
  id: string
  date: string
  title: string
  description: string
  tags: string[]
  type: 'policy' | 'reform' | 'crisis' | 'report' | 'election'
}

export interface KpiSummary {
  indicator: Indicator
  latestValue: number
  previousValue: number
  periodChange: number
  periodChangePct: number
  sparkline: DataPoint[]
  lastUpdated: string
  trend: 'up' | 'down' | 'flat'
  narrative: string
}

export interface AlertConfig {
  indicatorId: string
  threshold: number
  direction: 'above' | 'below'
  label: string
  enabled: boolean
}

export type DateRange = {
  start: string
  end: string
  label: string
}
