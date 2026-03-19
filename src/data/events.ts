import type { EconomicEvent } from '../types'

export const EVENTS: EconomicEvent[] = [
  { id: 'e1',  date: '2016-06-15', title: 'FX Policy Liberalisation', description: 'CBN removed the exchange rate peg, adopting a flexible FX regime.', tags: ['fx','cbn','reform'], type: 'reform' },
  { id: 'e2',  date: '2016-07-26', title: 'MPR Hiked to 14%', description: 'MPC raised MPR to 14% to combat rising inflation.', tags: ['mpr','inflation','cbn'], type: 'policy' },
  { id: 'e3',  date: '2017-04-10', title: 'GDP Exits Recession', description: 'Q1 2017 GDP growth turned positive, ending 5-quarter recession.', tags: ['gdp','recession'], type: 'report' },
  { id: 'e4',  date: '2019-02-23', title: 'Presidential Election', description: 'Muhammadu Buhari re-elected as President.', tags: ['election','political'], type: 'election' },
  { id: 'e5',  date: '2020-03-20', title: 'COVID-19 Lockdown', description: 'Federal Government imposed nationwide lockdown due to COVID-19 pandemic.', tags: ['covid','crisis','gdp'], type: 'crisis' },
  { id: 'e6',  date: '2020-04-20', title: 'Oil Price Crash', description: 'Brent crude fell below $20/barrel amid COVID-19 demand collapse.', tags: ['oil','crisis'], type: 'crisis' },
  { id: 'e7',  date: '2021-05-01', title: 'Fuel Subsidy Retained', description: 'Government maintained fuel subsidy despite fiscal pressures.', tags: ['subsidy','fiscal'], type: 'policy' },
  { id: 'e8',  date: '2022-05-24', title: 'MPR Hiked +150bps', description: 'CBN began aggressive tightening cycle, hiking MPR to 13%.', tags: ['mpr','inflation','cbn'], type: 'policy' },
  { id: 'e9',  date: '2023-05-29', title: 'Tinubu Inauguration', description: 'President Tinubu inaugurated; announced immediate fuel subsidy removal.', tags: ['election','subsidy','reform'], type: 'reform' },
  { id: 'e10', date: '2023-06-14', title: 'Fuel Subsidy Removed', description: 'Petrol subsidy removed; pump prices rose sharply, driving inflation higher.', tags: ['subsidy','inflation','reform'], type: 'reform' },
  { id: 'e11', date: '2023-06-16', title: 'FX Market Unified', description: 'CBN unified FX market windows; official rate depreciated sharply.', tags: ['fx','reform','cbn'], type: 'reform' },
  { id: 'e12', date: '2024-02-27', title: 'MPR Hiked to 22.75%', description: 'MPC raised MPR by 400bps in a single meeting to anchor inflation expectations.', tags: ['mpr','inflation','cbn'], type: 'policy' },
  { id: 'e13', date: '2024-03-26', title: 'MPR Hiked to 24.75%', description: 'Second consecutive emergency hike; MPR reaches highest level since CBN was created.', tags: ['mpr','cbn'], type: 'policy' },
  { id: 'e14', date: '2024-07-10', title: 'FX Reserves Recovery', description: 'CBN FX reserves crossed $35bn threshold following IMF disbursements.', tags: ['fx','reserves'], type: 'report' },
]
