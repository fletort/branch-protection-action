/**
 * Unit tests for the action's entrypoint, src/index.js
 */
import { jest } from '@jest/globals'

// 1. Declare Mocks
jest.unstable_mockModule('../src/main.js', () => {
  return {
    run: jest.fn()
  }
})

// 2. Import dynamically Mocked Modules
const { run } = await import('../src/main.js')

describe('index', () => {
  it('calls run when imported', async () => {
    await import('../src/index.js')
    expect(run).toHaveBeenCalled()
  })
})
