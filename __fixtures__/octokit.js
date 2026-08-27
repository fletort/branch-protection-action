import { jest } from '@jest/globals'

// 1. Define and export individual mock
export const mockgetRef = jest.fn()
export const mockcreateRef = jest.fn()
export const mockupdateBranchProtection = jest.fn()

// 2. Define and export the mocked Octokit class
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
