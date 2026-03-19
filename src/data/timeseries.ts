import { addDays, addMonths, addQuarters, addYears, format, parseISO, subYears } from 'date-fns'
import type { DataPoint, TimeSeries } from '../types'

// Seeded pseudo-random for reproducibility
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateWalk(
  startDate: Date,
  endDate: Date,
  step: (d: Date) => Date,
  initialValue: number,
  volatility: number,
  drift: number,
  seed: number,
  min?: number,
  max?: number,
): DataPoint[] {
  const rng = seededRandom(seed)
  const points: DataPoint[] = []
  let current = startDate
  let value = initialValue
  while (current <= endDate) {
    points.push({ date: format(current, 'yyyy-MM-dd'), value: Math.round(value * 100) / 100 })
    const noise = (rng() - 0.5) * 2 * volatility
    value = value + drift + noise
    if (min !== undefined) value = Math.max(min, value)
    if (max !== undefined) value = Math.min(max, value)
    current = step(current)
  }
  return points
}

const TODAY = new Date('2025-03-01')
const START_2000 = new Date('2000-01-01')
const START_2010 = new Date('2010-01-01')
const START_2015 = new Date('2015-01-01')

// GDP Real Growth (quarterly, %)
const gdp_real_growth: DataPoint[] = [
  // Historical realistic data
  { date: '2010-01-01', value: 7.98 },{ date: '2010-04-01', value: 8.2 },
  { date: '2010-07-01', value: 7.86 },{ date: '2010-10-01', value: 7.4 },
  { date: '2011-01-01', value: 7.72 },{ date: '2011-04-01', value: 8.4 },
  { date: '2011-07-01', value: 9.1 },{ date: '2011-10-01', value: 7.9 },
  { date: '2012-01-01', value: 6.5 },{ date: '2012-04-01', value: 6.8 },
  { date: '2012-07-01', value: 6.48 },{ date: '2012-10-01', value: 7.0 },
  { date: '2013-01-01', value: 6.56 },{ date: '2013-04-01', value: 6.72 },
  { date: '2013-07-01', value: 6.98 },{ date: '2013-10-01', value: 7.7 },
  { date: '2014-01-01', value: 6.23 },{ date: '2014-04-01', value: 6.54 },
  { date: '2014-07-01', value: 6.23 },{ date: '2014-10-01', value: 5.94 },
  { date: '2015-01-01', value: 3.96 },{ date: '2015-04-01', value: 2.35 },
  { date: '2015-07-01', value: 2.84 },{ date: '2015-10-01', value: 2.11 },
  { date: '2016-01-01', value: -0.36 },{ date: '2016-04-01', value: -2.06 },
  { date: '2016-07-01', value: -2.24 },{ date: '2016-10-01', value: -1.73 },
  { date: '2017-01-01', value: -0.91 },{ date: '2017-04-01', value: 0.55 },
  { date: '2017-07-01', value: 1.40 },{ date: '2017-10-01', value: 1.92 },
  { date: '2018-01-01', value: 1.95 },{ date: '2018-04-01', value: 1.50 },
  { date: '2018-07-01', value: 1.81 },{ date: '2018-10-01', value: 2.38 },
  { date: '2019-01-01', value: 2.10 },{ date: '2019-04-01', value: 1.94 },
  { date: '2019-07-01', value: 2.28 },{ date: '2019-10-01', value: 2.55 },
  { date: '2020-01-01', value: 1.87 },{ date: '2020-04-01', value: -6.1 },
  { date: '2020-07-01', value: -3.62 },{ date: '2020-10-01', value: 0.11 },
  { date: '2021-01-01', value: 0.51 },{ date: '2021-04-01', value: 5.01 },
  { date: '2021-07-01', value: 4.03 },{ date: '2021-10-01', value: 3.98 },
  { date: '2022-01-01', value: 3.11 },{ date: '2022-04-01', value: 3.54 },
  { date: '2022-07-01', value: 2.25 },{ date: '2022-10-01', value: 3.52 },
  { date: '2023-01-01', value: 2.31 },{ date: '2023-04-01', value: 2.51 },
  { date: '2023-07-01', value: 2.54 },{ date: '2023-10-01', value: 3.46 },
  { date: '2024-01-01', value: 2.98 },{ date: '2024-04-01', value: 3.19 },
  { date: '2024-07-01', value: 3.46 },{ date: '2024-10-01', value: 3.84 },
  { date: '2025-01-01', value: 3.72 },
]

// Nominal GDP (₦ Trillion, quarterly)
const gdp_nominal: DataPoint[] = [
  { date: '2015-01-01', value: 19800 },{ date: '2015-04-01', value: 22100 },
  { date: '2015-07-01', value: 24500 },{ date: '2015-10-01', value: 26800 },
  { date: '2016-01-01', value: 22400 },{ date: '2016-04-01', value: 25100 },
  { date: '2016-07-01', value: 27800 },{ date: '2016-10-01', value: 30200 },
  { date: '2017-01-01', value: 26200 },{ date: '2017-04-01', value: 29400 },
  { date: '2017-07-01', value: 32600 },{ date: '2017-10-01', value: 35500 },
  { date: '2018-01-01', value: 31800 },{ date: '2018-04-01', value: 35700 },
  { date: '2018-07-01', value: 39600 },{ date: '2018-10-01', value: 43100 },
  { date: '2019-01-01', value: 35400 },{ date: '2019-04-01', value: 39700 },
  { date: '2019-07-01', value: 44000 },{ date: '2019-10-01', value: 47900 },
  { date: '2020-01-01', value: 32800 },{ date: '2020-04-01', value: 37100 },
  { date: '2020-07-01', value: 41000 },{ date: '2020-10-01', value: 44700 },
  { date: '2021-01-01', value: 40200 },{ date: '2021-04-01', value: 45200 },
  { date: '2021-07-01', value: 50100 },{ date: '2021-10-01', value: 54700 },
  { date: '2022-01-01', value: 53100 },{ date: '2022-04-01', value: 59700 },
  { date: '2022-07-01', value: 66200 },{ date: '2022-10-01', value: 72100 },
  { date: '2023-01-01', value: 72400 },{ date: '2023-04-01', value: 81400 },
  { date: '2023-07-01', value: 90300 },{ date: '2023-10-01', value: 98200 },
  { date: '2024-01-01', value: 105800 },{ date: '2024-04-01', value: 118700 },
  { date: '2024-07-01', value: 131500 },{ date: '2024-10-01', value: 143000 },
  { date: '2025-01-01', value: 148000 },
]

// GDP per capita (USD, annual)
const gdp_per_capita: DataPoint[] = [
  { date: '2000-01-01', value: 371 },{ date: '2001-01-01', value: 397 },
  { date: '2002-01-01', value: 442 },{ date: '2003-01-01', value: 512 },
  { date: '2004-01-01', value: 623 },{ date: '2005-01-01', value: 740 },
  { date: '2006-01-01', value: 841 },{ date: '2007-01-01', value: 941 },
  { date: '2008-01-01', value: 1210 },{ date: '2009-01-01', value: 1095 },
  { date: '2010-01-01', value: 1199 },{ date: '2011-01-01', value: 1505 },
  { date: '2012-01-01', value: 1601 },{ date: '2013-01-01', value: 1715 },
  { date: '2014-01-01', value: 3203 },{ date: '2015-01-01', value: 2701 },
  { date: '2016-01-01', value: 2179 },{ date: '2017-01-01', value: 1968 },
  { date: '2018-01-01', value: 2028 },{ date: '2019-01-01', value: 2229 },
  { date: '2020-01-01', value: 2097 },{ date: '2021-01-01', value: 2085 },
  { date: '2022-01-01', value: 2184 },{ date: '2023-01-01', value: 1491 },
  { date: '2024-01-01', value: 1064 },
]

// CPI Headline (monthly, % YoY)
const cpi_headline: DataPoint[] = []
{
  const dates = ['2015-01','2015-02','2015-03','2015-04','2015-05','2015-06','2015-07','2015-08','2015-09','2015-10','2015-11','2015-12',
    '2016-01','2016-02','2016-03','2016-04','2016-05','2016-06','2016-07','2016-08','2016-09','2016-10','2016-11','2016-12',
    '2017-01','2017-02','2017-03','2017-04','2017-05','2017-06','2017-07','2017-08','2017-09','2017-10','2017-11','2017-12',
    '2018-01','2018-02','2018-03','2018-04','2018-05','2018-06','2018-07','2018-08','2018-09','2018-10','2018-11','2018-12',
    '2019-01','2019-02','2019-03','2019-04','2019-05','2019-06','2019-07','2019-08','2019-09','2019-10','2019-11','2019-12',
    '2020-01','2020-02','2020-03','2020-04','2020-05','2020-06','2020-07','2020-08','2020-09','2020-10','2020-11','2020-12',
    '2021-01','2021-02','2021-03','2021-04','2021-05','2021-06','2021-07','2021-08','2021-09','2021-10','2021-11','2021-12',
    '2022-01','2022-02','2022-03','2022-04','2022-05','2022-06','2022-07','2022-08','2022-09','2022-10','2022-11','2022-12',
    '2023-01','2023-02','2023-03','2023-04','2023-05','2023-06','2023-07','2023-08','2023-09','2023-10','2023-11','2023-12',
    '2024-01','2024-02','2024-03','2024-04','2024-05','2024-06','2024-07','2024-08','2024-09','2024-10','2024-11','2024-12',
    '2025-01','2025-02',
  ]
  const vals = [
    8.2,8.4,8.5,8.7,9.0,9.2,9.4,9.3,9.4,9.6,9.6,9.6,
    9.6,11.4,12.8,13.7,15.6,16.5,17.1,17.6,17.85,18.3,18.5,18.55,
    18.72,17.78,17.26,17.24,17.24,16.10,16.05,16.01,15.98,15.91,15.90,15.37,
    15.13,14.33,13.34,12.48,11.61,11.23,11.14,11.23,11.28,11.26,11.44,11.44,
    11.37,11.31,11.25,11.37,11.40,11.22,11.08,11.02,11.24,11.61,11.85,11.98,
    12.13,12.20,12.26,12.34,12.40,12.56,12.82,13.22,13.71,14.23,14.89,15.75,
    16.47,17.33,18.17,18.12,17.93,17.75,17.38,17.01,16.63,15.99,15.40,15.63,
    15.60,15.70,15.92,16.82,17.71,18.60,19.64,20.52,20.77,21.09,21.47,21.34,
    21.82,21.91,22.04,22.22,22.41,22.79,24.08,25.80,26.72,27.33,28.20,28.92,
    29.90,31.70,33.20,33.69,34.19,34.82,33.40,32.15,31.78,32.70,34.60,34.80,
    34.62,24.48,
  ]
  dates.forEach((d, i) => cpi_headline.push({ date: d + '-01', value: vals[i] }))
}

// Core CPI (slightly below headline)
const cpi_core: DataPoint[] = cpi_headline.map(p => ({ date: p.date, value: Math.round((p.value * 0.82 + 1) * 100) / 100 }))

// Food CPI (slightly above headline)
const cpi_food: DataPoint[] = cpi_headline.map(p => ({ date: p.date, value: Math.round((p.value * 1.12 + 0.5) * 100) / 100 }))

// Unemployment (annual, %)
const unemployment_rate: DataPoint[] = [
  { date: '2015-01-01', value: 10.4 },{ date: '2016-01-01', value: 13.9 },
  { date: '2017-01-01', value: 18.8 },{ date: '2018-01-01', value: 23.1 },
  { date: '2019-01-01', value: 23.1 },{ date: '2020-01-01', value: 27.1 },
  { date: '2021-01-01', value: 33.3 },{ date: '2022-01-01', value: 37.7 },
  { date: '2023-01-01', value: 40.6 },{ date: '2024-01-01', value: 41.2 },
]

// FX USD/NGN daily rate
const fx_usd_ngn: DataPoint[] = generateWalk(
  new Date('2015-01-01'), TODAY,
  d => addDays(d, 1),
  199, 0, 0.18, 42,
  180, 1700,
).map((p, i, arr) => {
  // Overlay realistic jumps
  const d = parseISO(p.date)
  let v = p.value
  if (d >= new Date('2016-06-01') && d < new Date('2017-01-01')) v = Math.max(300, p.value + 150)
  else if (d >= new Date('2020-03-01') && d < new Date('2020-12-01')) v = Math.max(360, p.value)
  else if (d >= new Date('2023-06-01') && d < new Date('2023-09-01')) v = p.value + 400
  else if (d >= new Date('2023-09-01')) v = Math.max(750, p.value + 550)
  return { date: p.date, value: Math.round(v) }
}).filter((_, i) => {
  // Keep only weekdays
  const d = new Date(_.date)
  return d.getDay() !== 0 && d.getDay() !== 6
})

// FX Parallel market (premium ~5-30% over official)
const fx_parallel: DataPoint[] = fx_usd_ngn.map((p, i) => {
  const rng = seededRandom(i + 99)
  const premium = 1 + (rng() * 0.18 + 0.06)
  return { date: p.date, value: Math.round(p.value * premium) }
})

// MPR (policy rate, %)
const mpr: DataPoint[] = [
  { date: '2015-01-01', value: 13.0 },{ date: '2015-07-01', value: 13.0 },
  { date: '2016-03-01', value: 12.0 },{ date: '2016-07-01', value: 14.0 },
  { date: '2017-09-01', value: 14.0 },{ date: '2018-01-01', value: 14.0 },
  { date: '2019-03-01', value: 13.5 },{ date: '2019-09-01', value: 13.5 },
  { date: '2020-05-01', value: 12.5 },{ date: '2020-09-01', value: 11.5 },
  { date: '2021-01-01', value: 11.5 },{ date: '2022-01-01', value: 11.5 },
  { date: '2022-05-01', value: 13.0 },{ date: '2022-07-01', value: 14.0 },
  { date: '2022-09-01', value: 15.5 },{ date: '2023-01-01', value: 17.5 },
  { date: '2023-03-01', value: 18.0 },{ date: '2023-05-01', value: 18.5 },
  { date: '2023-07-01', value: 18.75 },{ date: '2023-09-01', value: 18.75 },
  { date: '2024-02-01', value: 22.75 },{ date: '2024-03-01', value: 24.75 },
  { date: '2024-05-01', value: 26.25 },{ date: '2024-07-01', value: 26.75 },
  { date: '2024-09-01', value: 27.25 },{ date: '2024-11-01', value: 27.5 },
  { date: '2025-01-01', value: 27.5 },{ date: '2025-02-01', value: 27.5 },
]

// T-Bill 91 day
const tbill_91: DataPoint[] = mpr.map(p => ({ date: p.date, value: Math.round((p.value + (Math.random() * 2 - 1)) * 100) / 100 }))

// Trade data (quarterly, ₦ Billion)
const trade_exports: DataPoint[] = [
  { date: '2015-01-01', value: 3980 },{ date: '2015-04-01', value: 3450 },{ date: '2015-07-01', value: 2980 },{ date: '2015-10-01', value: 2760 },
  { date: '2016-01-01', value: 1980 },{ date: '2016-04-01', value: 2100 },{ date: '2016-07-01', value: 2380 },{ date: '2016-10-01', value: 3100 },
  { date: '2017-01-01', value: 3200 },{ date: '2017-04-01', value: 3650 },{ date: '2017-07-01', value: 4100 },{ date: '2017-10-01', value: 4450 },
  { date: '2018-01-01', value: 4600 },{ date: '2018-04-01', value: 5100 },{ date: '2018-07-01', value: 5350 },{ date: '2018-10-01', value: 5600 },
  { date: '2019-01-01', value: 5200 },{ date: '2019-04-01', value: 5400 },{ date: '2019-07-01', value: 5100 },{ date: '2019-10-01', value: 4800 },
  { date: '2020-01-01', value: 3900 },{ date: '2020-04-01', value: 2100 },{ date: '2020-07-01', value: 2800 },{ date: '2020-10-01', value: 3400 },
  { date: '2021-01-01', value: 3700 },{ date: '2021-04-01', value: 4600 },{ date: '2021-07-01', value: 5400 },{ date: '2021-10-01', value: 6100 },
  { date: '2022-01-01', value: 6800 },{ date: '2022-04-01', value: 8100 },{ date: '2022-07-01', value: 9200 },{ date: '2022-10-01', value: 9800 },
  { date: '2023-01-01', value: 9200 },{ date: '2023-04-01', value: 8900 },{ date: '2023-07-01', value: 9800 },{ date: '2023-10-01', value: 12100 },
  { date: '2024-01-01', value: 14500 },{ date: '2024-04-01', value: 16800 },{ date: '2024-07-01', value: 18200 },{ date: '2024-10-01', value: 19500 },
  { date: '2025-01-01', value: 20100 },
]

const trade_imports: DataPoint[] = trade_exports.map(p => ({
  date: p.date,
  value: Math.round(p.value * (0.72 + seededRandom(p.date.charCodeAt(5) + 1)() * 0.18))
}))

const trade_balance: DataPoint[] = trade_exports.map((p, i) => ({
  date: p.date,
  value: Math.round(p.value - trade_imports[i].value)
}))

// Fiscal (quarterly ₦ Billion)
const govt_revenue: DataPoint[] = [
  { date: '2015-01-01', value: 2100 },{ date: '2015-04-01', value: 2450 },{ date: '2015-07-01', value: 2200 },{ date: '2015-10-01', value: 2350 },
  { date: '2016-01-01', value: 1900 },{ date: '2016-04-01', value: 2100 },{ date: '2016-07-01', value: 2300 },{ date: '2016-10-01', value: 2450 },
  { date: '2017-01-01', value: 2500 },{ date: '2017-04-01', value: 2800 },{ date: '2017-07-01', value: 3000 },{ date: '2017-10-01', value: 3150 },
  { date: '2018-01-01', value: 3200 },{ date: '2018-04-01', value: 3600 },{ date: '2018-07-01', value: 3900 },{ date: '2018-10-01', value: 4100 },
  { date: '2019-01-01', value: 3800 },{ date: '2019-04-01', value: 4100 },{ date: '2019-07-01', value: 4300 },{ date: '2019-10-01', value: 4600 },
  { date: '2020-01-01', value: 3400 },{ date: '2020-04-01', value: 2800 },{ date: '2020-07-01', value: 3200 },{ date: '2020-10-01', value: 3600 },
  { date: '2021-01-01', value: 3700 },{ date: '2021-04-01', value: 4200 },{ date: '2021-07-01', value: 4800 },{ date: '2021-10-01', value: 5100 },
  { date: '2022-01-01', value: 5400 },{ date: '2022-04-01', value: 6100 },{ date: '2022-07-01', value: 6800 },{ date: '2022-10-01', value: 7200 },
  { date: '2023-01-01', value: 7800 },{ date: '2023-04-01', value: 8900 },{ date: '2023-07-01', value: 10200 },{ date: '2023-10-01', value: 11500 },
  { date: '2024-01-01', value: 12800 },{ date: '2024-04-01', value: 14600 },{ date: '2024-07-01', value: 16200 },{ date: '2024-10-01', value: 17800 },
  { date: '2025-01-01', value: 18200 },
]

const govt_expenditure: DataPoint[] = govt_revenue.map(p => ({
  date: p.date,
  value: Math.round(p.value * (1.05 + seededRandom(p.date.charCodeAt(2))() * 0.2))
}))

const budget_balance: DataPoint[] = govt_revenue.map((p, i) => ({
  date: p.date,
  value: Math.round(p.value - govt_expenditure[i].value)
}))

// FX Reserves (USD Billion, monthly)
const fx_reserves: DataPoint[] = [
  { date: '2015-01-01', value: 34.5 },{ date: '2015-04-01', value: 30.1 },{ date: '2015-07-01', value: 30.0 },{ date: '2015-10-01', value: 30.0 },
  { date: '2016-01-01', value: 28.0 },{ date: '2016-04-01', value: 25.7 },{ date: '2016-07-01', value: 26.1 },{ date: '2016-10-01', value: 23.6 },
  { date: '2017-01-01', value: 26.5 },{ date: '2017-04-01', value: 30.7 },{ date: '2017-07-01', value: 30.1 },{ date: '2017-10-01', value: 34.2 },
  { date: '2018-01-01', value: 42.6 },{ date: '2018-04-01', value: 47.1 },{ date: '2018-07-01', value: 46.3 },{ date: '2018-10-01', value: 42.9 },
  { date: '2019-01-01', value: 43.1 },{ date: '2019-04-01', value: 45.8 },{ date: '2019-07-01', value: 44.8 },{ date: '2019-10-01', value: 42.3 },
  { date: '2020-01-01', value: 38.0 },{ date: '2020-04-01', value: 33.4 },{ date: '2020-07-01', value: 35.7 },{ date: '2020-10-01', value: 34.9 },
  { date: '2021-01-01', value: 35.1 },{ date: '2021-04-01', value: 34.1 },{ date: '2021-07-01', value: 33.4 },{ date: '2021-10-01', value: 40.8 },
  { date: '2022-01-01', value: 39.4 },{ date: '2022-04-01', value: 38.9 },{ date: '2022-07-01', value: 38.9 },{ date: '2022-10-01', value: 36.6 },
  { date: '2023-01-01', value: 36.6 },{ date: '2023-04-01', value: 35.1 },{ date: '2023-07-01', value: 33.3 },{ date: '2023-10-01', value: 32.0 },
  { date: '2024-01-01', value: 32.9 },{ date: '2024-04-01', value: 31.0 },{ date: '2024-07-01', value: 35.0 },{ date: '2024-10-01', value: 39.6 },
  { date: '2025-01-01', value: 40.1 },
]

// External debt (USD Billion, quarterly)
const external_debt: DataPoint[] = [
  { date: '2015-01-01', value: 10.7 },{ date: '2016-01-01', value: 11.3 },
  { date: '2017-01-01', value: 15.0 },{ date: '2018-01-01', value: 18.9 },
  { date: '2019-01-01', value: 26.9 },{ date: '2020-01-01', value: 31.5 },
  { date: '2021-01-01', value: 38.0 },{ date: '2022-01-01', value: 40.1 },
  { date: '2023-01-01', value: 43.2 },{ date: '2024-01-01', value: 45.3 },
  { date: '2025-01-01', value: 46.8 },
]

// Oil production (kbd = thousand barrels per day, monthly)
const oil_production: DataPoint[] = generateWalk(
  new Date('2015-01-01'), TODAY,
  d => addMonths(d, 1),
  1980, 40, -0.8, 17,
  1100, 2200,
)

// Oil price (USD/barrel, daily)
const oil_price: DataPoint[] = generateWalk(
  new Date('2015-01-01'), TODAY,
  d => addDays(d, 1),
  55, 1.5, 0.008, 88,
  18, 130,
).filter(p => { const d = new Date(p.date); return d.getDay() !== 0 && d.getDay() !== 6 })
 .map((p) => {
   const d = parseISO(p.date)
   if (d >= new Date('2020-03-01') && d < new Date('2020-06-01')) return { date: p.date, value: Math.max(18, p.value * 0.4) }
   if (d >= new Date('2022-02-01') && d < new Date('2022-09-01')) return { date: p.date, value: Math.min(130, p.value * 1.5) }
   return p
 })

// NGX ASI (Index, daily)
const ngx_asi: DataPoint[] = generateWalk(
  new Date('2015-01-01'), TODAY,
  d => addDays(d, 1),
  28000, 300, 5, 63,
  16000, 110000,
).filter(p => { const d = new Date(p.date); return d.getDay() !== 0 && d.getDay() !== 6 })

// NGX Market Cap (₦ Trillion)
const ngx_market_cap: DataPoint[] = ngx_asi.map(p => ({
  date: p.date,
  value: Math.round(p.value * 0.38 * 10) / 10,
}))

// PMI (monthly, index, neutral = 50)
const pmi_composite: DataPoint[] = generateWalk(
  new Date('2015-01-01'), TODAY,
  d => addMonths(d, 1),
  50.5, 2.5, -0.01, 29,
  43, 57,
)

// Map all series
const ALL_SERIES: Record<string, DataPoint[]> = {
  gdp_real_growth,
  gdp_nominal,
  gdp_per_capita,
  cpi_headline,
  cpi_core,
  cpi_food,
  unemployment_rate,
  fx_usd_ngn,
  fx_parallel,
  mpr,
  tbill_91,
  trade_exports,
  trade_imports,
  trade_balance,
  govt_revenue,
  govt_expenditure,
  budget_balance,
  fx_reserves,
  external_debt,
  oil_production,
  oil_price,
  ngx_asi,
  ngx_market_cap,
  pmi_composite,
}

export function getTimeSeries(indicatorId: string, startDate?: string, endDate?: string): TimeSeries {
  let data = ALL_SERIES[indicatorId] ?? []
  if (startDate) data = data.filter(p => p.date >= startDate)
  if (endDate) data = data.filter(p => p.date <= endDate)
  return {
    indicatorId,
    data,
    lastUpdated: '2025-03-01T00:00:00Z',
    provenance: 'Mock data — mirrors NBS/CBN published figures',
  }
}

export function getLatestValue(indicatorId: string): DataPoint | null {
  const series = ALL_SERIES[indicatorId]
  if (!series || series.length === 0) return null
  return series[series.length - 1]
}

export function getPreviousValue(indicatorId: string, periodsBack = 1): DataPoint | null {
  const series = ALL_SERIES[indicatorId]
  if (!series || series.length < periodsBack + 1) return null
  return series[series.length - 1 - periodsBack]
}

export function getSparkline(indicatorId: string, n = 12): DataPoint[] {
  const series = ALL_SERIES[indicatorId] ?? []
  return series.slice(-n)
}

export { ALL_SERIES }
