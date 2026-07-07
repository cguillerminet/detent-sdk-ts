import type { DetentError } from './errors'

export type Algorithm = 'sliding_window' | 'token_bucket' | 'fixed_window'
export type FailMode = 'open' | 'closed'

export interface DetentConfig {
  apiKey: string
  baseUrl?: string          // default 'https://api.detent.fr'
  timeoutMs?: number        // default 1000
  failMode?: FailMode       // default 'open'
  onError?: (err: DetentError) => void
}

export interface LimitOptions {
  namespace: string
  key: string
  algorithm?: Algorithm
  limit?: number
  windowMs?: number
}

export interface LimitResult {
  allowed: boolean
  remaining: number
  resetMs: number
  limit: number
  /** true when this is a fail-open/fail-closed result, not a real decision. */
  degraded: boolean
}

export interface AcquireOptions {
  namespace: string
  key: string
  limit?: number
  windowMs?: number
}

export interface AcquireResult {
  allowed: boolean
  leaseId?: string
  active: number
  limit: number
  resetMs: number
  /** Release this lease; a no-op when `allowed` is false. */
  release(): Promise<ReleaseResult | void>
}

export interface ReleaseResult {
  released: boolean
  active: number
}

export interface StatsOptions {
  namespace: string
}

export interface DayStat {
  day: string
  total: number
  blocked: number
}

export interface MonthSummary {
  month: string
  total: number
  quota: number | null
  overQuota: boolean
}

export interface StatsResult {
  namespace: string
  total: number
  blocked: number
  days: DayStat[]
  month: MonthSummary
}
