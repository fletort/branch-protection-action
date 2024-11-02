const axios = require('axios')
const fs = require('fs/promises')
const YAML = require('yaml')

function isValidUrl(urlString) {
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // validate protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ) // validate fragment locator
  return !!urlPattern.test(urlString)
}

async function downloadFileContent(url) {
  let fileData = null
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    fileData = Buffer.from(response.data, 'binary').toString()
    console.debug('file content downloaded!')
  } catch (err) {
    // https://axios-http.com/fr/docs/handling_errors
    if (err.response) {
      // The request was made and the server responded with an error status code
      console.debug(
        `Error ${err.response.status} when trying to download file (${url}). ${JSON.stringify(err.response.data)}`
      )
    } else if (err.request) {
      // The request was made but no response was received
      console.debug(`Timeout (no reply) when trying to download file (${url}).`)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.debug(`Internal Error: ${err.message}`)
    }
  }
  return fileData
}

async function readFileContent(filePath) {
  let fileData = null
  try {
    await fs.access(filePath, fs.constants.F_OK)
    console.debug('File exists')
    fileData = await fs.readFile(filePath)
    fileData = fileData.toString()
  } catch {
    console.debug('File does not exist or Read Error')
  }
  return fileData
}

/**
 * Load Branches definition.
 *
 * @param {string} branches File or Link or Definition
 * @returns {Promise<string>} Resolves with 'done!' after the wait is over.
 */
async function load(branches) {
  let data = null
  let definition = null

  if (isValidUrl(branches)) {
    data = await downloadFileContent(branches)
  }
  if (data == null) {
    console.debug('input is not a valid web link')
    data = await readFileContent(branches)
  }
  if (data == null) {
    console.debug('input is not a valid filePath')
    data = branches
    console.debug('input should be definition itself')
  }

  try {
    definition = JSON.parse(data)
  } catch {
    console.debug('input is not valid JSON')
  }

  try {
    if (definition == null) {
      definition = YAML.parse(data)
      console.debug('input is parsed as YAML')
    }
  } catch {
    console.debug('input is not valid YAML')
  }

  return definition
}

module.exports = { isValidUrl, downloadFileContent, readFileContent, load }
