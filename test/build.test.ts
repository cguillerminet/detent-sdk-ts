import { describe, it, expect } from 'vitest'

describe('public surface', () => {
  it('exports Detent and error classes from the barrel', async () => {
    const mod = await import('../src/index')
    expect(typeof mod.Detent).toBe('function')
    expect(typeof mod.DetentApiError).toBe('function')
    expect(typeof mod.DetentTransportError).toBe('function')
    expect(typeof mod.DetentLeaseDeniedError).toBe('function')
  })
})
