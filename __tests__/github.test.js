/**
 * Unit tests for src/github.js
 */
import { jest, expect } from '@jest/globals'
// Import mock fixtures
import * as octokitFixture from '../__fixtures__/octokit.js'

// 1. Mocks should be declared before the module being tested is imported.

// Mock the Octokit library
jest.unstable_mockModule('@octokit/rest', () => octokitFixture)

// 2. Import dynamically Mocked Modules
const { Octokit } = await import('@octokit/rest')
const { mockgetRef, mockcreateRef, mockupdateBranchProtection } = octokitFixture

// 3. The module being tested should be imported dynamically.
const githubModule = await import('../src/github.js')
const { GitHub } = githubModule

describe('Github.constuct', () => {
  it('Github class save owner/repo and istanciate Octokit class with token inforamtion', () => {
    const ut = new GitHub('owner', 'repo', 'token')
    expect(ut.owner).toBe('owner')
    expect(ut.repo).toBe('repo')
    expect(Octokit).toHaveBeenCalledWith({ auth: 'token' })
  })
})

describe('Github.getBranch', () => {
  it('Get existing branch return the ref description', async () => {
    mockgetRef.mockImplementation(async () =>
      Promise.resolve({ status: 200, data: 'ref description' })
    )
    const ut = new GitHub('owner', 'repo', 'token')

    const ret = await ut.getBranch('TestBranch')
    expect(mockgetRef).toHaveBeenCalled()
    expect(ret).toBe('ref description')
  })

  it('Get non existing branch return nothing', async () => {
    mockgetRef.mockImplementation(async () =>
      Promise.resolve({ status: 404, data: 'ref description' })
    )
    const ut = new GitHub('owner', 'repo', 'token')

    const ret = await ut.getBranch('TestBranch')
    expect(mockgetRef).toHaveBeenCalled()
    expect(ret).toBeNull()
  })

  it('Throw Exception on not waited web code return', async () => {
    mockgetRef.mockImplementation(async () =>
      Promise.resolve({ status: 500, data: 'ref description' })
    )
    const ut = new GitHub('owner', 'repo', 'token')

    await expect(async () => {
      await ut.getBranch('TestBranch')
    }).rejects.toThrow(Error)
  })
})

describe('Github.createBranch', () => {
  it('Trying to create an existing branch does nothing', async () => {
    mockgetRef.mockImplementation(async () =>
      Promise.resolve({ status: 200, data: 'ref description' })
    )
    const ut = new GitHub('owner', 'repo', 'token')

    await ut.createBranch('TestBranch')

    expect(mockgetRef).toHaveBeenCalled()
    expect(mockcreateRef).toHaveBeenCalledTimes(0)
  })

  it('Trying to create a new branch on non existing base branch throw an Error', async () => {
    mockgetRef.mockImplementation(async () =>
      Promise.resolve({ status: 404, data: 'ref description' })
    )
    const ut = new GitHub('owner', 'repo', 'token')

    await expect(async () => {
      await ut.createBranch('TestBranch', 'BaseBranch')
    }).rejects.toThrow(Error)

    expect(mockgetRef).toHaveBeenCalledTimes(2)
    expect(mockgetRef.mock.calls).toEqual([
      [{ owner: 'owner', repo: 'repo', ref: 'heads/TestBranch' }],
      [{ owner: 'owner', repo: 'repo', ref: 'heads/BaseBranch' }]
    ])

    expect(mockcreateRef).toHaveBeenCalledTimes(0)
  })

  it('Create a new branch on a correct base branch without error', async () => {
    mockgetRef.mockImplementation(async (d) => {
      if (d.ref === 'heads/TestBranch')
        return Promise.resolve({ status: 404, data: 'ref description' })
      if (d.ref === 'heads/BaseBranch')
        return Promise.resolve({
          status: 200,
          data: { object: { sha: 'mytestsha' } }
        })
    })
    mockcreateRef.mockImplementation(async () => {
      return Promise.resolve({ status: 201 })
    })
    const ut = new GitHub('owner', 'repo', 'token')

    await ut.createBranch('TestBranch', 'BaseBranch')

    expect(mockgetRef).toHaveBeenCalledTimes(2)
    expect(mockgetRef.mock.calls).toEqual([
      [{ owner: 'owner', repo: 'repo', ref: 'heads/TestBranch' }],
      [{ owner: 'owner', repo: 'repo', ref: 'heads/BaseBranch' }]
    ])

    expect(mockcreateRef).toHaveBeenCalledWith({
      owner: 'owner',
      ref: 'refs/heads/TestBranch',
      repo: 'repo',
      sha: 'mytestsha'
    })
  })

  it('Throw exception when branch creation is not succefull', async () => {
    mockgetRef.mockImplementation(async (d) => {
      if (d.ref === 'heads/TestBranch')
        return Promise.resolve({ status: 404, data: 'ref description' })
      if (d.ref === 'heads/BaseBranch')
        return Promise.resolve({
          status: 200,
          data: { object: { sha: 'mytestsha' } }
        })
    })
    mockcreateRef.mockImplementation(async () => {
      return Promise.resolve({ status: 500 })
    })
    const ut = new GitHub('owner', 'repo', 'token')

    await expect(async () => {
      await ut.createBranch('TestBranch', 'BaseBranch')
    }).rejects.toThrow(Error)

    expect(mockgetRef).toHaveBeenCalledTimes(2)
    expect(mockgetRef.mock.calls).toEqual([
      [{ owner: 'owner', repo: 'repo', ref: 'heads/TestBranch' }],
      [{ owner: 'owner', repo: 'repo', ref: 'heads/BaseBranch' }]
    ])

    expect(mockcreateRef).toHaveBeenCalledWith({
      owner: 'owner',
      ref: 'refs/heads/TestBranch',
      repo: 'repo',
      sha: 'mytestsha'
    })
  })
})

describe('Github.setBranchPermission', () => {
  it('SetBranchPermission add information to send parameter and return normally when succesfull', async () => {
    mockupdateBranchProtection.mockImplementation(async () =>
      Promise.resolve({ status: 200 })
    )
    const ut = new GitHub('owner', 'repo', 'token')

    await ut.setBranchPermission('mytestbranch', { keytoadd: 'valuetest' })

    expect(mockupdateBranchProtection).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'mytestbranch',
      keytoadd: 'valuetest'
    })
  })

  it('SetBranchPermission dont change mandatory parameter as repo', async () => {
    mockupdateBranchProtection.mockImplementation(async () =>
      Promise.resolve({ status: 200 })
    )
    const ut = new GitHub('owner', 'repo', 'token')

    await ut.setBranchPermission('mytestbranch', { repo: 'trytochange' })

    expect(mockupdateBranchProtection).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'mytestbranch'
    })
  })

  it('SetBranchPermission throw exception when a not waited web code return', async () => {
    mockupdateBranchProtection.mockImplementation(async () =>
      Promise.resolve({ status: 500 })
    )
    const ut = new GitHub('owner', 'repo', 'token')

    await expect(async () => {
      await ut.setBranchPermission('mytestbranch', { keytoadd: 'valuetest' })
    }).rejects.toThrow(Error)
  })
})
