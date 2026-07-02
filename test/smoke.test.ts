import { describe, it, expect } from 'vitest'

describe('package', () => {
  it('imports the barrel', async () => {
    const mod = await import('../src/index')
    expect(mod).toBeDefined()
  })
})
