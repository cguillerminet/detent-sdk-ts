import type { StatsOptions, StatsResult } from './types'
import type { components } from './generated/openapi'

type Requester = <T>(method: string, path: string, body?: unknown) => Promise<T>

type StatsWire = components['schemas']['StatsResponse']

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
      quota: w.month.quota ?? null,
      overQuota: w.month.over_quota,
    },
  }
}
