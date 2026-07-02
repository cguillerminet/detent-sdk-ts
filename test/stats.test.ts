import { describe, it, expect, vi, afterEach } from 'vitest'
import { Detent } from '../src/client'

function mockFetch(impl: typeof fetch) { vi.stubGlobal('fetch', impl) }
afterEach(() => { vi.unstubAllGlobals() })

const wire = {
  namespace: 'api', total: 100, blocked: 4,
  days: [{ day: '2026-07-01', total: 60, blocked: 2 }],
  month: { month: '2026-07', total: 100, quota: 1000, over_quota: false },
}

describe('getStats()', () => {
  it('GETs the namespace stats path and maps over_quota', async () => {
    let captured: any
    mockFetch((async (url: any, init: any) => {
      captured = { url: String(url), method: init.method }
      return new Response(JSON.stringify(wire), { status: 200 })
    }) as any)
    const rg = new Detent({ apiKey: 'x', baseUrl: 'https://api.example.com' })
    const r = await rg.getStats({ namespace: 'api' })
    expect(captured).toEqual({ url: 'https://api.example.com/v1/namespaces/api/stats', method: 'GET' })
    expect(r.month.overQuota).toBe(false)
    expect(r.month.quota).toBe(1000)
    expect(r.days[0]).toEqual({ day: '2026-07-01', total: 60, blocked: 2 })
    expect(r.total).toBe(100)
  })

  it('encodes the namespace in the path', async () => {
    let url = ''
    mockFetch((async (u: any) => { url = String(u); return new Response(JSON.stringify(wire), { status: 200 }) }) as any)
    const rg = new Detent({ apiKey: 'x', baseUrl: 'https://api.example.com' })
    await rg.getStats({ namespace: 'a/b' })
    expect(url).toBe('https://api.example.com/v1/namespaces/a%2Fb/stats')
  })

  it('throws DetentApiError on 401 (no fail-open here)', async () => {
    mockFetch((async () => new Response(JSON.stringify({ error: 'bad key' }), { status: 401 })) as any)
    const rg = new Detent({ apiKey: 'x' })
    await expect(rg.getStats({ namespace: 'api' })).rejects.toMatchObject({ name: 'DetentApiError' })
  })
})
