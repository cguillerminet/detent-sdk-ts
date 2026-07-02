import { describe, it, expect } from 'vitest'
import { Detent } from '../src/index'

const URL = process.env.DETENT_TEST_URL
const KEY = process.env.DETENT_TEST_KEY
const run = URL && KEY ? describe : describe.skip

run('live API (opt-in)', () => {
  it('limit() returns a decision against a real namespace', async () => {
    const rg = new Detent({ apiKey: KEY!, baseUrl: URL!, timeoutMs: 3000 })
    const r = await rg.limit({ namespace: 'sdk-it', key: 'k1', algorithm: 'fixed_window', limit: 5, windowMs: 10_000 })
    expect(typeof r.allowed).toBe('boolean')
    expect(r.degraded).toBe(false)
  })
})
