/**
 * Unit tests for the action's main functionality, src/main.js
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
// Import mock fixtures
import * as coreFixture from '../__fixtures__/core.js'

// -- 1. Mocks should be declared before the module being tested is imported.

// Mock the core module to avoid importing the actual '@actions/core' module
jest.unstable_mockModule('@actions/core', () => coreFixture)

// Mock internal Definition Parser library
jest.unstable_mockModule('../src/definition.js', () => {
  return {
    load: jest.fn() // Add as a basic mocked function
  }
})

// Mock internal GitHub Library
const mockCreateBranch = jest.fn()
const mockSetBranchPermission = jest.fn()
jest.unstable_mockModule('../src/github.js', () => {
  return {
    GitHub: jest.fn().mockImplementation(() => {
      return {
        createBranch: mockCreateBranch,
        setBranchPermission: mockSetBranchPermission
      }
    })
  }
})

// -- 2. Import dynamically Mocked Modules
const githubModule = await import('../src/github.js')
const { GitHub } = githubModule

const definitionModule = await import('../src/definition.js')
const { load } = definitionModule

const core = await import('@actions/core')
const getInputMock = core.getInput
const setFailedMock = core.setFailed

// -- 3. The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const main = await import('../src/main.js')

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Parse the given definition, Create the Branch on the default base branch then Apply the given Permission', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case 'repository':
          return 'MyTestOwner/MyTestRepo'
        case 'token':
          return 'MyTestToken'
        case 'branches':
          return 'MyDefinition'
        case 'default_base_branch':
          return 'main'
        default:
          return ''
      }
    })
    load.mockImplementation(() =>
      Promise.resolve({
        develop: {
          permission: 'MY_PERMISSION_DEF'
        }
      })
    )

    await main.run()
    expect(GitHub).toHaveBeenCalledWith(
      'MyTestOwner',
      'MyTestRepo',
      'MyTestToken'
    )
    expect(load).toHaveBeenCalledWith('MyDefinition')
    expect(mockCreateBranch).toHaveBeenCalledWith('develop', 'main')
    expect(mockSetBranchPermission).toHaveBeenCalledWith(
      'develop',
      'MY_PERMISSION_DEF'
    )
    expect(setFailedMock).not.toHaveBeenCalled()
  })

  it('Parse the given definition, Create the Branch on the specific base branch then Apply the given Permission', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case 'repository':
          return 'MyTestOwner/MyTestRepo'
        case 'token':
          return 'MyTestToken'
        case 'branches':
          return 'MyDefinition'
        case 'default_base_branch':
          return 'main'
        default:
          return ''
      }
    })
    load.mockImplementation(() =>
      Promise.resolve({
        develop: {
          baseBranch: 'MySpecificBaseBranch',
          permission: 'MY_PERMISSION_DEF'
        }
      })
    )

    await main.run()
    expect(GitHub).toHaveBeenCalledWith(
      'MyTestOwner',
      'MyTestRepo',
      'MyTestToken'
    )
    expect(load).toHaveBeenCalledWith('MyDefinition')
    expect(mockCreateBranch).toHaveBeenCalledWith(
      'develop',
      'MySpecificBaseBranch'
    )
    expect(mockSetBranchPermission).toHaveBeenCalledWith(
      'develop',
      'MY_PERMISSION_DEF'
    )
    expect(setFailedMock).not.toHaveBeenCalled()
  })

  it('Dont create permission when permission is not given for a branch', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case 'repository':
          return 'MyTestOwner/MyTestRepo'
        case 'token':
          return 'MyTestToken'
        case 'branches':
          return 'MyDefinition'
        case 'default_base_branch':
          return 'main'
        default:
          return ''
      }
    })
    load.mockImplementation(() =>
      Promise.resolve({
        develop: {
          baseBranch: 'MySpecificBaseBranch'
        }
      })
    )

    await main.run()
    expect(GitHub).toHaveBeenCalledWith(
      'MyTestOwner',
      'MyTestRepo',
      'MyTestToken'
    )
    expect(load).toHaveBeenCalledWith('MyDefinition')
    expect(mockCreateBranch).toHaveBeenCalledWith(
      'develop',
      'MySpecificBaseBranch'
    )
    expect(mockSetBranchPermission).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
  })

  it('Dont create permission when nothing is given for a branch', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case 'repository':
          return 'MyTestOwner/MyTestRepo'
        case 'token':
          return 'MyTestToken'
        case 'branches':
          return 'MyDefinition'
        case 'default_base_branch':
          return 'main'
        default:
          return ''
      }
    })
    load.mockImplementation(() =>
      Promise.resolve({
        develop: null
      })
    )

    await main.run()
    expect(GitHub).toHaveBeenCalledWith(
      'MyTestOwner',
      'MyTestRepo',
      'MyTestToken'
    )
    expect(load).toHaveBeenCalledWith('MyDefinition')
    expect(mockCreateBranch).toHaveBeenCalledWith('develop', 'main')
    expect(mockSetBranchPermission).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
  })

  it('Fail when error occurs', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case 'repository':
          return 'MyTestOwner/MyTestRepo'
        case 'token':
          return 'MyTestToken'
        case 'branches':
          return 'MyDefinition'
        case 'default_base_branch':
          return 'main'
        default:
          return ''
      }
    })
    load.mockImplementation(() => {
      throw new Error('MyTestDescriptionError')
    })

    await main.run()
    expect(setFailedMock).toHaveBeenCalledWith('MyTestDescriptionError')
  })

  it('Fail when malformatted repository is given', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case 'repository':
          return 'MyTestOwner'
        case 'token':
          return 'MyTestToken'
        case 'branches':
          return 'MyDefinition'
        case 'default_base_branch':
          return 'main'
        default:
          return ''
      }
    })

    await main.run()
    expect(setFailedMock).toHaveBeenCalled()
  })
})
