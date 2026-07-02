import { describe, it, expect } from 'vitest'
import {
  DetentError, DetentApiError, DetentTransportError, DetentLeaseDeniedError,
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

  it('DetentLeaseDeniedError carries the acquire result', () => {
    const result = { allowed: false, active: 5, limit: 5, resetMs: 200, release: async () => {} }
    const e = new DetentLeaseDeniedError(result)
    expect(e.result.active).toBe(5)
  })
})
