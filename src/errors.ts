import type { AcquireResult } from './types'

export class DetentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DetentError'
  }
}

export class DetentApiError extends DetentError {
  readonly status: number
  readonly body: { error: string }
  constructor(status: number, body: { error: string }) {
    super(`Detent API error ${status}: ${body.error}`)
    this.name = 'DetentApiError'
    this.status = status
    this.body = body
  }
}

/**
 * Thrown when the account has exceeded its monthly hard ceiling (§4.2 anti-abuse
 * cap) — the API returned `429 { error: "monthly_hard_cap" }`. Subclasses
 * `DetentApiError`, so it carries `status` (always 429) and `body`, and existing
 * `instanceof DetentApiError` handling still applies (it is NEVER failed open —
 * the cap is a deliberate block). Catch this specifically to alert or prompt an
 * upgrade rather than treating it as a routine denial.
 */
export class DetentQuotaExceededError extends DetentApiError {
  constructor(body: { error: string }) {
    super(429, body)
    this.name = 'DetentQuotaExceededError'
  }
}

export class DetentTransportError extends DetentError {
  readonly cause: unknown
  constructor(message: string, cause: unknown) {
    super(message)
    this.name = 'DetentTransportError'
    this.cause = cause
  }
}

export class DetentLeaseDeniedError extends DetentError {
  readonly result: AcquireResult
  constructor(result: AcquireResult) {
    super('Lease denied: no concurrent slot available')
    this.name = 'DetentLeaseDeniedError'
    this.result = result
  }
}
