# 🇳🇬 Nigeria Economic Dashboard

A production-ready, interactive web dashboard presenting Nigeria's key macroeconomic and market indicators with rich visualisations, trend analysis, CSV exports, and configurable threshold alerts.

> **Live demo:** Deploy locally with `npm install && npm run dev`

---

## Features

### KPI Summary Row
- 8 pinned top-level KPIs — CPI Inflation, USD/NGN FX Rate, MPR, GDP Growth, FX Reserves, Oil Production, NGX ASI, PMI
- Each card shows: latest value, period-on-period change (absolute + %), sparkline, and alert badge if threshold is breached
- Click any card to open a full drilldown panel

### Time Series Charts (Overview tab)
- Interactive line/area chart with up to **4 simultaneous indicators**
- **Zoom & pan** via bottom brush control
- **Hover tooltips** showing exact values with proper units
- **Economic events overlay** — major policy changes, reforms, and crises marked directly on the chart
- Per-chart CSV download

### Compare Tab
- Multi-indicator overlay chart
- **Trade Composition** stacked bar chart (Exports vs Imports in ₦ Billion)
- Switch and add indicators via the searchable selector panel

### Correlation Tab
- **Scatter plot** with linear regression line, displaying Pearson r and R²
- **Correlation matrix** — 6 pre-computed key pairs (e.g. CPI × FX Rate, Oil Price × Reserves)
- Configurable X and Y axis selectors

### Drilldown Modal
- Full time-series chart per indicator
- **Monthly heatmap** (for monthly/quarterly data) — colour-coded by high/low direction
- **AI-style narrative analysis** paragraph for each indicator
- Sortable raw data table with period-on-period change column
- Per-indicator CSV download
- **Share** link button (copies URL with state)
- Source attribution with link to official data provider

### Filters
- **Date range presets**: 3M, 6M, 1Y, 3Y, 5Y, 10Y, All
- **Custom date range** pickers
- **Frequency toggle**: Daily / Monthly / Quarterly / Annual
- **Category filter**: GDP, Inflation, Labour, Exchange, Interest Rates, Trade, Fiscal, External, Commodities, Financial Markets, Leading Indicators
- **Events overlay toggle**

### Alerts & Thresholds
- 5 pre-configured threshold alerts (editable):
  - Inflation > 20%
  - USD/NGN > ₦1,600
  - FX Reserves < $30bn
  - Oil Production < 1,200 kbd
  - PMI < 50 (contraction)
- Active alerts shown in header bell badge and alert panel
- Per-alert enable/disable toggle

### Accessibility & UX
- Full **dark mode** toggle
- **High-contrast mode**
- Keyboard navigable (focus rings, Escape to close modals)
- ARIA roles, labels, and live regions throughout
- Responsive layout: mobile → tablet → desktop (up to 2xl)
- **Export All CSV** — bulk download of every indicator for the selected date range

---

## Indicators Covered (24 total)

| Category | Indicators |
|---|---|
| **GDP & Growth** | Real GDP Growth Rate, Nominal GDP, GDP Per Capita |
| **Inflation** | CPI Headline, Core Inflation, Food Inflation |
| **Labour** | Unemployment Rate |
| **Exchange Rates** | USD/NGN Official, Parallel Market FX |
| **Interest Rates** | Monetary Policy Rate (MPR), 91-Day T-Bill |
| **Trade** | Exports, Imports, Trade Balance |
| **Fiscal** | Government Revenue, Expenditure, Budget Balance |
| **External Sector** | FX Reserves, External Debt |
| **Commodities** | Crude Oil Production, Brent Crude Price |
| **Financial Markets** | NGX All-Share Index, NGX Market Cap |
| **Leading Indicators** | Manufacturing PMI |

---

## Data Sources

| Source | Data |
|---|---|
| National Bureau of Statistics (NBS) | GDP, Inflation, Labour, Trade, Fiscal |
| Central Bank of Nigeria (CBN) | FX Rates, Reserves, MPR, T-Bills |
| World Bank / IMF | Long-run series, GDP per capita |
| NGX Group | Stock index, Market cap |
| NNPC / OPEC | Oil production |
| ICE / EIA | Brent crude price |
| Stanbic IBTC / S&P Global | PMI |

> **Note:** The current version uses carefully calibrated mock data that mirrors published NBS/CBN figures through March 2025. To connect live APIs, replace the functions in `src/data/timeseries.ts` with real fetch calls and implement the ETL scheduler described below.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts 2 |
| Date handling | date-fns |
| Icons | Lucide React |
| Data export | PapaParse, XLSX |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Local development

```bash
# Clone the repo
git clone https://github.com/<your-username>/nigeria-econ-dashboard.git
cd nigeria-econ-dashboard

# Install dependencies
npm install

# Start dev server with hot reload
npm run dev
# → Opens at http://localhost:5173
```

### Production build

```bash
npm run build
# Output in /dist — deploy to any static host (Vercel, Netlify, AWS S3, etc.)
```

---

## Project Structure

```
src/
├── components/
│   ├── charts/
│   │   ├── AlertsPanel.tsx       # Threshold alert configuration panel
│   │   ├── CorrelationChart.tsx  # Scatter + regression chart
│   │   ├── EventsTimeline.tsx    # Economic events sidebar
│   │   ├── HeatmapChart.tsx      # Monthly heatmap grid
│   │   ├── IndicatorSelector.tsx # Searchable indicator picker
│   │   └── TimeSeriesChart.tsx   # Main interactive line/area chart
│   ├── filters/
│   │   └── FilterBar.tsx         # Date range, frequency, category filters
│   ├── kpi/
│   │   ├── KpiCard.tsx           # Individual KPI card with sparkline
│   │   └── KpiRow.tsx            # Horizontal KPI row container
│   ├── layout/
│   │   └── Header.tsx            # Sticky header with nav, dark mode, alerts
│   └── modals/
│       └── DrilldownModal.tsx    # Full indicator drilldown panel
├── data/
│   ├── events.ts                 # Major economic events (annotated on charts)
│   ├── export.ts                 # Bulk CSV export utility
│   ├── indicators.ts             # Indicator metadata & category definitions
│   ├── narratives.ts             # AI-style analysis text per indicator
│   └── timeseries.ts             # Time series data (mock; replace with API)
├── hooks/
│   └── useDashboard.ts           # Central dashboard state management hook
├── types/
│   └── index.ts                  # TypeScript interfaces
└── utils/
    └── format.ts                 # Value formatters, CSV export, color utils
```

---

## Data Schema

### Indicator metadata
```typescript
{
  id: string              // e.g. "cpi_headline"
  name: string            // Full display name
  shortName: string       // Short label for charts
  category: Category      // e.g. "inflation"
  source: string          // Data provider name
  sourceUrl: string       // Link to official source
  frequency: Frequency    // "daily" | "monthly" | "quarterly" | "annual"
  units: string           // e.g. "% YoY"
  description: string     // Plain-language explanation
  positiveDirection: "up" | "down"  // Is an increase good or bad?
  alertThreshold?: number
  alertDirection?: "above" | "below"
  format?: "number" | "percent" | "currency" | "rate"
}
```

### Time series point
```typescript
{
  date: string   // ISO date "YYYY-MM-DD"
  value: number  // Numeric value
}
```

### Economic event
```typescript
{
  id: string
  date: string       // ISO date
  title: string
  description: string
  tags: string[]
  type: "policy" | "reform" | "crisis" | "report" | "election"
}
```

---

## ETL Runbook (Production)

To replace mock data with live data:

1. **NBS & CBN data**: Use the NBS open data portal and CBN statistics portal. Many reports are published as Excel files — write a Python/Node.js scraper to parse and ingest them.
2. **World Bank API**: `https://api.worldbank.org/v2/country/NG/indicator/{indicator_code}?format=json`
3. **Scheduling**: Use GitHub Actions cron jobs, AWS EventBridge, or Airflow to run ETL at appropriate frequencies (daily for FX/stocks, monthly for CPI, quarterly for GDP).
4. **Storage**: Store canonical time series in PostgreSQL (`indicators`, `timeseries`, `events` tables as per schema above). Use Redis to cache recent queries.
5. **API layer**: Expose a simple FastAPI or Express REST API. Update `src/data/timeseries.ts` to call `GET /api/timeseries/{indicatorId}?start=&end=` instead of returning static arrays.

---

## Acceptance Criteria

- [x] All 24 core indicators present with correct units and period labels
- [x] Dashboard updates last-updated timestamp per indicator
- [x] Charts are interactive (hover, zoom via brush, download CSV)
- [x] Drilldown opens on KPI card click with full data table
- [x] Data download produces correct CSV with metadata columns
- [x] Responsive layout works on mobile (320px) and desktop (1920px)
- [x] Dark mode and high-contrast mode work correctly
- [x] Threshold alerts fire correctly and show in header bell
- [x] Economic events render as reference lines on time series
- [x] Correlation scatter shows r and R² statistics
- [x] TypeScript compiles with zero errors

---

## Roadmap

| Phase | Features |
|---|---|
| **MVP (current)** | KPI row, time series, compare, correlation, drilldown, CSV export, alerts |
| **Phase 2** | Live API integration, automated ETL, subnational choropleth map, PDF report generation |
| **Phase 3** | Forecasting module (ARIMA/Prophet), user authentication, saved dashboards, multi-language (Hausa, Yoruba, Igbo) |

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss the proposed change.

## Licence

MIT
