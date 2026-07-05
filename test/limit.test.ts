import { describe, it, expect, vi, afterEach } from 'vitest'
import { Detent } from '../src/client'

const wire = { allowed: true, remaining: 9, reset_ms: 1234, limit: 10 }
function mockFetch(impl: typeof fetch) { vi.stubGlobal('fetch', impl) }
afterEach(() => { vi.unstubAllGlobals() })

describe('limit()', () => {
  it('maps wire → camelCase and marks non-degraded', async () => {
    let sentBody: any
    mockFetch((async (_u: any, init: any) => {
      sentBody = JSON.parse(init.body)
      return new Response(JSON.stringify(wire), { status: 200 })
    }) as any)

    const rg = new Detent({ apiKey: 'x' })
    const r = await rg.limit({ namespace: 'api', key: 'u1', windowMs: 60000, limit: 10 })

    expect(sentBody).toEqual({ namespace: 'api', key: 'u1', window_ms: 60000, limit: 10 })
    expect(r).toEqual({ allowed: true, remaining: 9, resetMs: 1234, limit: 10, degraded: false })
  })

  it('normal denial (200 allowed:false) resolves, not throws', async () => {
    mockFetch((async () => new Response(JSON.stringify({ ...wire, allowed: false, remaining: 0 }), { status: 200 })) as any)
    const rg = new Detent({ apiKey: 'x' })
    const r = await rg.limit({ namespace: 'api', key: 'u1' })
    expect(r.allowed).toBe(false)
    expect(r.degraded).toBe(false)
  })

  it('fail-open on transport error: allowed:true, degraded:true, onError called', async () => {
    mockFetch((async () => { throw new TypeError('fetch failed') }) as any)
    const onError = vi.fn()
    const rg = new Detent({ apiKey: 'x', failMode: 'open', onError })
    const r = await rg.limit({ namespace: 'api', key: 'u1', limit: 10 })
    expect(r).toEqual({ allowed: true, remaining: 0, resetMs: 0, limit: 10, degraded: true })
    expect(onError).toHaveBeenCalledOnce()
  })

  it('fail-closed on transport error: allowed:false, degraded:true', async () => {
    mockFetch((async () => { throw new TypeError('fetch failed') }) as any)
    const rg = new Detent({ apiKey: 'x', failMode: 'closed' })
    const r = await rg.limit({ namespace: 'api', key: 'u1' })
    expect(r).toMatchObject({ allowed: false, degraded: true })
  })

  it('API 4xx throws (never fail-open on a 401)', async () => {
    mockFetch((async () => new Response(JSON.stringify({ error: 'bad key' }), { status: 401 })) as any)
    const rg = new Detent({ apiKey: 'x', failMode: 'open' })
    await expect(rg.limit({ namespace: 'api', key: 'u1' })).rejects.toMatchObject({ name: 'DetentApiError' })
  })

  it('503 under failMode:open → degraded:true, allowed:true, onError called once', async () => {
    mockFetch((async () => new Response(JSON.stringify({ error: 'gateway error' }), { status: 503 })) as any)
    const onError = vi.fn()
    const rg = new Detent({ apiKey: 'x', failMode: 'open', onError })
    const r = await rg.limit({ namespace: 'api', key: 'u1', limit: 10 })
    expect(r).toMatchObject({ allowed: true, degraded: true })
    expect(onError).toHaveBeenCalledOnce()
  })

  it('503 under failMode:closed → degraded:true, allowed:false', async () => {
    mockFetch((async () => new Response(JSON.stringify({ error: 'gateway error' }), { status: 503 })) as any)
    const rg = new Detent({ apiKey: 'x', failMode: 'closed' })
    const r = await rg.limit({ namespace: 'api', key: 'u1' })
    expect(r).toMatchObject({ allowed: false, degraded: true })
  })

  it('400 still throws DetentApiError (4xx never degrades)', async () => {
    mockFetch((async () => new Response(JSON.stringify({ error: 'malformed' }), { status: 400 })) as any)
    const rg = new Detent({ apiKey: 'x', failMode: 'open' })
    await expect(rg.limit({ namespace: 'api', key: 'u1' })).rejects.toMatchObject({ name: 'DetentApiError', status: 400 })
  })

  it('429 monthly_hard_cap throws DetentQuotaExceededError, never fail-open', async () => {
    mockFetch((async () => new Response(JSON.stringify({ error: 'monthly_hard_cap' }), { status: 429 })) as any)
    // failMode:open must NOT suppress the hard cap — it is a deliberate block.
    const rg = new Detent({ apiKey: 'x', failMode: 'open' })
    await expect(rg.limit({ namespace: 'api', key: 'u1' })).rejects.toMatchObject({
      name: 'DetentQuotaExceededError', status: 429,
    })
  })

  it('a 429 with a different body stays a generic DetentApiError', async () => {
    mockFetch((async () => new Response(JSON.stringify({ error: 'slow down' }), { status: 429 })) as any)
    const rg = new Detent({ apiKey: 'x' })
    await expect(rg.limit({ namespace: 'api', key: 'u1' })).rejects.toMatchObject({
      name: 'DetentApiError', status: 429,
    })
  })
})
