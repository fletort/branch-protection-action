/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require('@actions/core')
const main = require('../src/main')

// Mock the GitHub Actions core library
const debugMock = jest.spyOn(core, 'debug').mockImplementation()
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

// Mock internal Definition Parser library
const { load } = require('../src/definition')
jest.mock('../src/definition')

// Mock internal GitHub Library
const { GitHub } = require('../src/github')
const mockCreateBranch = jest.fn()
const mockSetBranchPermission = jest.fn()
jest.mock('../src/github', () => {
  return {
    GitHub: jest.fn().mockImplementation(() => {
      return {
        createBranch: mockCreateBranch,
        setBranchPermission: mockSetBranchPermission
      }
    })
  }
})

// Mock the tested action's main function
const runMock = jest.spyOn(main, 'run')

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Parse the given definition, Create the Branch on the default base branch then Apply the given Permission', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
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
    expect(runMock).toHaveReturned()
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
    getInputMock.mockImplementation(name => {
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
    expect(runMock).toHaveReturned()
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
    getInputMock.mockImplementation(name => {
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
    expect(runMock).toHaveReturned()
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
    getInputMock.mockImplementation(name => {
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
    expect(runMock).toHaveReturned()
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
    getInputMock.mockImplementation(name => {
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
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledWith('MyTestDescriptionError')
  })

  it('Fail when malformatted repository is given', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
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
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalled()
  })
})
