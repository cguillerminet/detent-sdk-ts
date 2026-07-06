import type { AcquireResult } from './types'

export class DetentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DetentError'
  }
}

/**
 * Stable machine error codes the public `/v1` surface can return, for
 * client-side localization / dispatch (see DECISIONS §2.2, API #56/#57).
 * Dashboard-only codes are intentionally omitted — the SDK never hits those
 * endpoints.
 */
export type DetentErrorCode =
  | 'payment_required'
  | 'monthly_hard_cap'
  | 'algorithm_not_on_plan'
  | 'invalid_request'
  | 'unknown_algorithm'
  | 'invalid_duration'

export class DetentApiError extends DetentError {
  readonly status: number
  readonly body: { error: string; code?: string }
  /** Stable machine error code, when the API tagged this error with one. */
  readonly code?: DetentErrorCode | (string & {})
  constructor(status: number, body: { error: string; code?: string }) {
    super(`Detent API error ${status}: ${body.error}`)
    this.name = 'DetentApiError'
    this.status = status
    this.body = body
    this.code = body.code ?? undefined
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
  constructor(body: { error: string; code?: string }) {
    super(429, body)
    this.name = 'DetentQuotaExceededError'
  }
}

/** 402 — account out of billing good standing (§7). Never failed open. */
export class DetentPaymentRequiredError extends DetentApiError {
  constructor(body: { error: string; code?: string }) {
    super(402, body)
    this.name = 'DetentPaymentRequiredError'
  }
}

/** 403 — the rule's algorithm is not available on the account's plan. */
export class DetentAlgorithmNotOnPlanError extends DetentApiError {
  constructor(body: { error: string; code?: string }) {
    super(403, body)
    this.name = 'DetentAlgorithmNotOnPlanError'
  }
}

/** 400 — malformed request body. */
export class DetentInvalidRequestError extends DetentApiError {
  constructor(body: { error: string; code?: string }) {
    super(400, body)
    this.name = 'DetentInvalidRequestError'
  }
}

/** 400 — unknown algorithm name. */
export class DetentUnknownAlgorithmError extends DetentApiError {
  constructor(body: { error: string; code?: string }) {
    super(400, body)
    this.name = 'DetentUnknownAlgorithmError'
  }
}

/** 400 — invalid duration. */
export class DetentInvalidDurationError extends DetentApiError {
  constructor(body: { error: string; code?: string }) {
    super(400, body)
    this.name = 'DetentInvalidDurationError'
  }
}

/**
 * Build the most specific error for a 4xx/5xx response. Keys off the machine
 * `code` (#56/#57); falls back to the legacy `error` string so an SDK pointed
 * at an API predating the gate `code` still yields the typed quota/payment
 * errors. Unknown codes → plain `DetentApiError`.
 */
export function apiErrorFrom(
  status: number,
  body: { error: string; code?: string },
): DetentApiError {
  switch (body.code ?? body.error) {
    case 'payment_required':
      return new DetentPaymentRequiredError(body)
    case 'monthly_hard_cap':
      return new DetentQuotaExceededError(body)
    case 'algorithm_not_on_plan':
      return new DetentAlgorithmNotOnPlanError(body)
    case 'invalid_request':
      return new DetentInvalidRequestError(body)
    case 'unknown_algorithm':
      return new DetentUnknownAlgorithmError(body)
    case 'invalid_duration':
      return new DetentInvalidDurationError(body)
    default:
      return new DetentApiError(status, body)
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
