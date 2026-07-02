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
})
