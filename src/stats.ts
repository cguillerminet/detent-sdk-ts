import type { StatsOptions, StatsResult } from './types'

type Requester = <T>(method: string, path: string, body?: unknown) => Promise<T>

interface StatsWire {
  namespace: string
  total: number
  blocked: number
  days: { day: string; total: number; blocked: number }[]
  month: { month: string; total: number; quota: number | null; over_quota: boolean }
}

export async function getStats(request: Requester, opts: StatsOptions): Promise<StatsResult> {
  const w = await request<StatsWire>(
    'GET', `/v1/namespaces/${encodeURIComponent(opts.namespace)}/stats`,
  )
  return {
    namespace: w.namespace,
    total: w.total,
    blocked: w.blocked,
    days: w.days.map((d) => ({ day: d.day, total: d.total, blocked: d.blocked })),
    month: {
      month: w.month.month,
      total: w.month.total,
      quota: w.month.quota,
      overQuota: w.month.over_quota,
    },
  }
}
