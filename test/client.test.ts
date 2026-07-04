import { describe, it, expect, vi, afterEach } from 'vitest'
import { Detent } from '../src/client'
import { DetentApiError, DetentTransportError } from '../src/errors'

function mockFetch(impl: typeof fetch) {
  vi.stubGlobal('fetch', impl)
}
afterEach(() => { vi.unstubAllGlobals() })

describe('Detent.request', () => {
  it('sends Bearer auth + JSON and returns parsed body on 200', async () => {
    let captured: { url: string; init: RequestInit } | undefined
    mockFetch((async (url: any, init: any) => {
      captured = { url: String(url), init }
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }) as any)

    const rg = new Detent({ apiKey: 'dt_test_abc', baseUrl: 'https://api.example.com' })
    const out = await (rg as any).request('POST', '/v1/limit', { namespace: 'n', key: 'k' })

    expect(out).toEqual({ ok: true })
    expect(captured!.url).toBe('https://api.example.com/v1/limit')
    expect((captured!.init.headers as any).Authorization).toBe('Bearer dt_test_abc')
    expect((captured!.init.headers as any)['Content-Type']).toBe('application/json')
    expect(captured!.init.method).toBe('POST')
    expect(JSON.parse(captured!.init.body as string)).toEqual({ namespace: 'n', key: 'k' })
  })

  it('throws DetentApiError with parsed body on 4xx', async () => {
    mockFetch((async () => new Response(JSON.stringify({ error: 'bad key' }), { status: 401 })) as any)
    const rg = new Detent({ apiKey: 'x' })
    await expect((rg as any).request('POST', '/v1/limit', {})).rejects.toMatchObject({
      name: 'DetentApiError', status: 401, body: { error: 'bad key' },
    })
  })

  it('throws DetentTransportError on network failure', async () => {
    mockFetch((async () => { throw new TypeError('fetch failed') }) as any)
    const rg = new Detent({ apiKey: 'x' })
    await expect((rg as any).request('POST', '/v1/limit', {})).rejects.toBeInstanceOf(DetentTransportError)
  })

  it('throws DetentTransportError on timeout (abort)', async () => {
    mockFetch((async (_url: any, init: any) =>
      new Promise((_res, rej) => {
        init.signal.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError')))
      })) as any)
    const rg = new Detent({ apiKey: 'x', timeoutMs: 5 })
    await expect((rg as any).request('POST', '/v1/limit', {})).rejects.toBeInstanceOf(DetentTransportError)
  })
})
