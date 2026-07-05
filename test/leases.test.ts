import { describe, it, expect, vi, afterEach } from 'vitest'
import { Detent } from '../src/client'
import { DetentLeaseDeniedError } from '../src/errors'

function mockFetch(impl: typeof fetch) { vi.stubGlobal('fetch', impl) }
afterEach(() => { vi.unstubAllGlobals() })

const acquired = { allowed: true, lease_id: 'LID', active: 1, limit: 5, reset_ms: 0 }
const denied = { allowed: false, active: 5, limit: 5, reset_ms: 300 }

describe('acquire()/release()', () => {
  it('maps acquire wire → camelCase', async () => {
    mockFetch((async () => new Response(JSON.stringify(acquired), { status: 200 })) as any)
    const rg = new Detent({ apiKey: 'x' })
    const r = await rg.acquire({ namespace: 'n', key: 'k' })
    expect(r).toMatchObject({ allowed: true, leaseId: 'LID', active: 1, limit: 5, resetMs: 0 })
  })

  it('acquire() throws DetentQuotaExceededError on a 429 monthly_hard_cap', async () => {
    mockFetch((async () => new Response(JSON.stringify({ error: 'monthly_hard_cap' }), { status: 429 })) as any)
    const rg = new Detent({ apiKey: 'x' })
    await expect(rg.acquire({ namespace: 'n', key: 'k' })).rejects.toMatchObject({
      name: 'DetentQuotaExceededError', status: 429,
    })
  })

  it('release() issues DELETE to the lease path and returns result', async () => {
    let captured: any
    mockFetch((async (url: any, init: any) => {
      captured = { url: String(url), method: init.method }
      return new Response(JSON.stringify({ released: true, active: 0 }), { status: 200 })
    }) as any)
    const rg = new Detent({ apiKey: 'x', baseUrl: 'https://api.example.com' })
    const r = await rg.release('LID')
    expect(captured).toEqual({ url: 'https://api.example.com/v1/leases/LID', method: 'DELETE' })
    expect(r).toEqual({ released: true, active: 0 })
  })

  it('acquire().release() is a no-op when denied', async () => {
    const calls: string[] = []
    mockFetch((async (url: any, init: any) => {
      calls.push(`${init.method} ${url}`)
      return new Response(JSON.stringify(denied), { status: 200 })
    }) as any)
    const rg = new Detent({ apiKey: 'x' })
    const r = await rg.acquire({ namespace: 'n', key: 'k' })
    await r.release()
    expect(calls).toEqual(['POST https://api.detent.dev/v1/leases']) // no DELETE
  })
})

describe('withLease()', () => {
  it('runs fn and releases on success', async () => {
    const calls: string[] = []
    mockFetch((async (url: any, init: any) => {
      calls.push(`${init.method} ${String(url).split('/').pop()}`)
      const body = init.method === 'POST' ? acquired : { released: true, active: 0 }
      return new Response(JSON.stringify(body), { status: 200 })
    }) as any)
    const rg = new Detent({ apiKey: 'x' })
    const out = await rg.withLease({ namespace: 'n', key: 'k' }, async () => 'work-done')
    expect(out).toBe('work-done')
    expect(calls).toEqual(['POST leases', 'DELETE LID'])
  })

  it('releases even when fn throws, and surfaces the fn error', async () => {
    const calls: string[] = []
    mockFetch((async (url: any, init: any) => {
      calls.push(init.method)
      const body = init.method === 'POST' ? acquired : { released: true, active: 0 }
      return new Response(JSON.stringify(body), { status: 200 })
    }) as any)
    const rg = new Detent({ apiKey: 'x' })
    await expect(
      rg.withLease({ namespace: 'n', key: 'k' }, async () => { throw new Error('boom') }),
    ).rejects.toThrow('boom')
    expect(calls).toEqual(['POST', 'DELETE']) // released despite throw
  })

  it('throws DetentLeaseDeniedError when denied and does not run fn', async () => {
    mockFetch((async () => new Response(JSON.stringify(denied), { status: 200 })) as any)
    const rg = new Detent({ apiKey: 'x' })
    const fn = vi.fn(async () => 'x')
    await expect(rg.withLease({ namespace: 'n', key: 'k' }, fn)).rejects.toBeInstanceOf(DetentLeaseDeniedError)
    expect(fn).not.toHaveBeenCalled()
  })
})
