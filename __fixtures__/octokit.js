import { jest } from '@jest/globals'

// 1. Déclarer et exporter les espions individuels
export const mockgetRef = jest.fn()
export const mockcreateRef = jest.fn()
export const mockupdateBranchProtection = jest.fn()

// 2. Déclarer et exporter la classe Octokit mockée
export const Octokit = jest.fn().mockImplementation(() => {
  return {
    rest: {
      git: {
        getRef: mockgetRef,
        createRef: mockcreateRef
      },
      repos: {
        updateBranchProtection: mockupdateBranchProtection
      }
    }
  }
})
