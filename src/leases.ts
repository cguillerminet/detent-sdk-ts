import { DetentLeaseDeniedError } from './errors'
import type { AcquireOptions, AcquireResult, ReleaseResult } from './types'
import type { components } from './generated/openapi'

type Requester = <T>(method: string, path: string, body?: unknown) => Promise<T>

type AcquireWire = components['schemas']['AcquireResponse']

export async function acquireLease(request: Requester, opts: AcquireOptions): Promise<AcquireResult> {
  const body = {
    namespace: opts.namespace,
    key: opts.key,
    ...(opts.limit !== undefined ? { limit: opts.limit } : {}),
    ...(opts.windowMs !== undefined ? { window_ms: opts.windowMs } : {}),
  }
  const w = await request<AcquireWire>('POST', '/v1/leases', body)
  const result: AcquireResult = {
    allowed: w.allowed,
    leaseId: w.lease_id ?? undefined,
    active: w.active,
    limit: w.limit,
    resetMs: w.reset_ms,
    release: async () => {
      if (!w.allowed || !w.lease_id) return
      return releaseLease(request, w.lease_id)
    },
  }
  return result
}

export async function releaseLease(request: Requester, leaseId: string): Promise<ReleaseResult> {
  return request<ReleaseResult>('DELETE', `/v1/leases/${encodeURIComponent(leaseId)}`)
}

export async function withLease<T>(
  request: Requester,
  opts: AcquireOptions,
  fn: () => Promise<T>,
): Promise<T> {
  const lease = await acquireLease(request, opts)
  if (!lease.allowed) throw new DetentLeaseDeniedError(lease)
  let threw = false
  try {
    return await fn()
  } catch (e) {
    threw = true
    throw e
  } finally {
    // Best-effort release. If fn already threw, don't let a release error mask it.
    try {
      await lease.release()
    } catch (releaseErr) {
      if (!threw) throw releaseErr
    }
  }
}
