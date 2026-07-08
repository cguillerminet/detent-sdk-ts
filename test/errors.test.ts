import { describe, it, expect } from 'vitest'
import {
  DetentError, DetentApiError, DetentQuotaExceededError,
  DetentPaymentRequiredError, DetentAlgorithmNotOnPlanError,
  DetentInvalidRequestError, DetentUnknownAlgorithmError, DetentInvalidDurationError,
  DetentKeyTypeConflictError,
  DetentTransportError, DetentLeaseDeniedError, apiErrorFrom,
} from '../src/errors'

describe('errors', () => {
  it('DetentApiError carries status and body and is a DetentError', () => {
    const e = new DetentApiError(401, { error: 'bad key' })
    expect(e).toBeInstanceOf(DetentError)
    expect(e.status).toBe(401)
    expect(e.body.error).toBe('bad key')
    expect(e.message).toContain('401')
  })

  it('DetentTransportError carries the cause', () => {
    const cause = new Error('ECONNREFUSED')
    const e = new DetentTransportError('network', cause)
    expect(e).toBeInstanceOf(DetentError)
    expect(e.cause).toBe(cause)
  })

  it('DetentQuotaExceededError is a DetentApiError with status 429', () => {
    const e = new DetentQuotaExceededError({ error: 'monthly_hard_cap' })
    expect(e).toBeInstanceOf(DetentApiError)
    expect(e).toBeInstanceOf(DetentError)
    expect(e.status).toBe(429)
    expect(e.body.error).toBe('monthly_hard_cap')
    expect(e.name).toBe('DetentQuotaExceededError')
  })

  it('DetentLeaseDeniedError carries the acquire result', () => {
    const result = { allowed: false, active: 5, limit: 5, resetMs: 200, release: async () => {} }
    const e = new DetentLeaseDeniedError(result)
    expect(e.result.active).toBe(5)
  })

  it('DetentKeyTypeConflictError is a DetentApiError with status 409', () => {
    const e = new DetentKeyTypeConflictError({ error: 'key_type_conflict' })
    expect(e).toBeInstanceOf(DetentApiError)
    expect(e).toBeInstanceOf(DetentError)
    expect(e.status).toBe(409)
    expect(e.body.error).toBe('key_type_conflict')
    expect(e.name).toBe('DetentKeyTypeConflictError')
  })

  it('apiErrorFrom dispatches each public-surface code to its subclass', () => {
    const cases: Array<[string, number, string]> = [
      ['payment_required', 402, 'DetentPaymentRequiredError'],
      ['monthly_hard_cap', 429, 'DetentQuotaExceededError'],
      ['algorithm_not_on_plan', 403, 'DetentAlgorithmNotOnPlanError'],
      ['invalid_request', 400, 'DetentInvalidRequestError'],
      ['unknown_algorithm', 400, 'DetentUnknownAlgorithmError'],
      ['invalid_duration', 400, 'DetentInvalidDurationError'],
      ['key_type_conflict', 409, 'DetentKeyTypeConflictError'],
    ]
    for (const [code, status, name] of cases) {
      const e = apiErrorFrom(status, { error: 'human message', code })
      expect(e).toBeInstanceOf(DetentApiError)
      expect(e.name).toBe(name)
      expect(e.status).toBe(status)
      expect(e.code).toBe(code)
    }
  })

  it('apiErrorFrom falls back to the error string for a code-less gate body', () => {
    const q = apiErrorFrom(429, { error: 'monthly_hard_cap' })
    expect(q).toBeInstanceOf(DetentQuotaExceededError)
    const p = apiErrorFrom(402, { error: 'payment_required' })
    expect(p).toBeInstanceOf(DetentPaymentRequiredError)
  })

  it('apiErrorFrom defaults to DetentApiError for an unknown code', () => {
    const e = apiErrorFrom(404, { error: 'not found', code: 'rule_not_found' })
    expect(e.constructor).toBe(DetentApiError)
    expect(e.status).toBe(404)
    expect(e.code).toBe('rule_not_found')
  })
})
