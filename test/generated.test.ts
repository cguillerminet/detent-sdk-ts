import { describe, it, expect } from 'vitest'

describe('generated types', () => {
  it('module loads (types are erased at runtime, so just assert import works)', async () => {
    const mod = await import('../src/generated/openapi')
    expect(mod).toBeDefined()
  })
})
