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
