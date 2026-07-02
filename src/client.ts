import { DetentApiError, DetentTransportError } from './errors'
import type { DetentConfig, FailMode, LimitOptions, LimitResult } from './types'

const DEFAULT_BASE_URL = 'https://api.detent.dev'
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

  /** Single HTTP choke point. 2xx → T; 4xx/5xx → DetentApiError; network/abort → DetentTransportError. */
  protected async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)
    let res: Response
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      })
    } catch (cause) {
      throw new DetentTransportError('Detent request failed', cause)
    } finally {
      clearTimeout(timer)
    }

    if (!res.ok) {
      let parsed: { error: string }
      try {
        parsed = (await res.json()) as { error: string }
      } catch {
        parsed = { error: res.statusText || `HTTP ${res.status}` }
      }
      throw new DetentApiError(res.status, parsed)
    }

    return (await res.json()) as T
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
      const w = await this.request<{ allowed: boolean; remaining: number; reset_ms: number; limit: number }>(
        'POST', '/v1/limit', body,
      )
      return { allowed: w.allowed, remaining: w.remaining, resetMs: w.reset_ms, limit: w.limit, degraded: false }
    } catch (err) {
      if (err instanceof DetentTransportError) {
        this.onError?.(err)
        return { allowed: this.failMode === 'open', remaining: 0, resetMs: 0, limit: opts.limit ?? 0, degraded: true }
      }
      throw err // DetentApiError and anything else
    }
  }
}
