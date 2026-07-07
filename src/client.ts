import { DetentApiError, DetentTransportError, apiErrorFrom } from './errors'
import { acquireLease, releaseLease, withLease } from './leases'
import { getStats } from './stats'
import type {
  DetentConfig, FailMode, LimitOptions, LimitResult,
  AcquireOptions, AcquireResult, ReleaseResult,
  StatsOptions, StatsResult,
} from './types'
import type { components } from './generated/openapi'

const DEFAULT_BASE_URL = 'https://api.detent.fr'
const DEFAULT_TIMEOUT_MS = 1000

export class Detent {
  protected readonly apiKey: string
  protected readonly baseUrl: string
  protected readonly timeoutMs: number
  protected readonly failMode: FailMode
  protected readonly onError?: DetentConfig['onError']

  constructor(config: DetentConfig) {
    if (!config?.apiKey) throw new Error('Detent: apiKey is required')
    this.apiKey = config.apiKey
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '')
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS
    this.failMode = config.failMode ?? 'open'
    this.onError = config.onError
  }

  /** Single HTTP choke point. 2xx → T; 4xx/5xx → DetentApiError; network/abort/body-stall → DetentTransportError. */
  protected async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      })
      if (!res.ok) {
        let parsed: { error: string; code?: string }
        try {
          parsed = (await res.json()) as { error: string; code?: string }
        } catch {
          parsed = { error: res.statusText || `HTTP ${res.status}` }
        }
        // One factory maps status+code to the most specific typed error
        // (quota, payment, algorithm-not-on-plan, validation) — both limit()
        // and acquire() route through here, so both get it.
        throw apiErrorFrom(res.status, parsed)
      }
      return (await res.json()) as T
    } catch (cause) {
      if (cause instanceof DetentApiError) throw cause
      throw new DetentTransportError('Detent request failed', cause)
    } finally {
      clearTimeout(timer)
    }
  }

  acquire(opts: AcquireOptions): Promise<AcquireResult> {
    return acquireLease(this.request.bind(this), opts)
  }

  release(leaseId: string): Promise<ReleaseResult> {
    return releaseLease(this.request.bind(this), leaseId)
  }

  withLease<T>(opts: AcquireOptions, fn: () => Promise<T>): Promise<T> {
    return withLease(this.request.bind(this), opts, fn)
  }

  async limit(opts: LimitOptions): Promise<LimitResult> {
    const body = {
      namespace: opts.namespace,
      key: opts.key,
      ...(opts.algorithm !== undefined ? { algorithm: opts.algorithm } : {}),
      ...(opts.limit !== undefined ? { limit: opts.limit } : {}),
      ...(opts.windowMs !== undefined ? { window_ms: opts.windowMs } : {}),
    }
    try {
      const w = await this.request<components['schemas']['LimitResponse']>(
        'POST', '/v1/limit', body,
      )
      return { allowed: w.allowed, remaining: w.remaining, resetMs: w.reset_ms, limit: w.limit, degraded: false }
    } catch (err) {
      if (err instanceof DetentTransportError || (err instanceof DetentApiError && err.status >= 500)) {
        this.onError?.(err)
        return { allowed: this.failMode === 'open', remaining: 0, resetMs: 0, limit: opts.limit ?? 0, degraded: true }
      }
      throw err // 4xx client errors and anything else
    }
  }

  getStats(opts: StatsOptions): Promise<StatsResult> {
    return getStats(this.request.bind(this), opts)
  }
}
