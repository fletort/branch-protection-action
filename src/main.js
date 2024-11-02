const core = require('@actions/core')
const { load } = require('./definition')
const { GitHub } = require('./github')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const def = core.getInput('branches', { required: true })
    const owner = core.getInput('owner', { required: true })
    const repo = core.getInput('repository', { required: true })
    const token = core.getInput('token', { required: true })
    const defaultBaseBranch = core.getInput('default_base_branch', {
      required: true
    })

    const github = new GitHub(owner, repo, token)

    // Get Definitions
    const definitions = await load(def)
    if (definitions == null) {
      core.setFailed('branches definition is not valid')
      return
    }

    for (const branch of Object.keys(definitions)) {
      const definition = definitions[branch]
      core.info(`Manage branch: ${branch}`)
      let baseBranch = defaultBaseBranch

      if (definition) {
        try {
          const testDict = 'baseBranch' in definition
        } catch (error) {
          core.debug(`Dict test error: ${error.message}`)
          core.setFailed('branches input content is not valid')
          return
        }
      }

      if (definition && 'baseBranch' in definition) {
        baseBranch = definition.baseBranch
        core.debug(`base branch is defined: ${baseBranch}`)
      }
      await github.createBranch(branch, baseBranch)

      if (definition && 'permission' in definition) {
        core.info(`Define Permission`)
        await github.setBranchPermission(branch, definition.permission)
      }
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
