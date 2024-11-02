const { Octokit } = require('@octokit/rest')

class GitHub {
  constructor(owner, repo, token) {
    this.octokit = new Octokit({
      auth: token
    })
    this.owner = owner
    this.repo = repo
  }

  async getBranch(branchName) {
    // Permission: "Contents" repository permissions (read) (OR PUBLIC ressource)
    try {
      const result = await this.octokit.rest.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branchName}`
      })
      if (result.status === 200) {
        return result.data
      }
      if (result.status !== 404) {
        throw new Error(
          `Error when trying to chek for branch: ${result.status}`
        )
      }
    } catch (error) {
      if (error.status) {
        if (error.status !== 404) {
          throw new Error(
            `Error when trying to chek for branch: ${error.status}`
          )
        }
      } else {
        // handle all other errors
        throw error
      }
    }

    return null
  }

  async createBranch(branchName, fromBranchName) {
    const brToCreate = await this.getBranch(branchName)
    if (brToCreate != null) {
      return
    }
    const fromBranch = await this.getBranch(fromBranchName)
    if (fromBranch == null) {
      throw new Error(
        `Branch ${branchName} can not be created as base branch ${fromBranchName} does not exist`
      )
    }

    // ==> create the branch
    // Permission: "Contents" repository permissions (write)
    const resultCreate = await this.octokit.rest.git.createRef({
      owner: this.owner,
      repo: this.repo,
      ref: `refs/heads/${branchName}`,
      sha: fromBranch.object.sha
    })
    if (resultCreate.status !== 201) {
      throw new Error(
        `Error when trying to create the branch ${branchName}: ${resultCreate}`
      )
    }
  }

  async setBranchPermission(branchName, permission) {
    // Permission: "Administration" repository permissions (write)
    const prop = {
      owner: this.owner,
      repo: this.repo,
      branch: branchName
    }

    const resultCreate = await this.octokit.rest.repos.updateBranchProtection({
      ...permission,
      ...prop
    })
    if (resultCreate.status !== 200) {
      throw new Error(
        `Error when trying to set permission for the branch ${branchName}: ${resultCreate.data}`
      )
    }
  }
}

module.exports = { GitHub }
