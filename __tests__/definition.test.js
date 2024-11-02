/**
 * Unit tests for src/definition.js
 */
const {
  isValidUrl,
  downloadFileContent,
  readFileContent,
  load
} = require('../src/definition')
const { expect } = require('@jest/globals')

// Mock the axios library
const axios = require('axios')
jest.mock('axios')

// Mock the fs library
const fs = require('fs/promises')
jest.mock('fs/promises')

describe('definition.isValidUrl', () => {
  it('detects some valid url', () => {
    let isValid = isValidUrl('https://www.github.com/')
    expect(isValid).toBe(true)
    isValid = isValidUrl('www.github.com')
    expect(isValid).toBe(true)
    isValid = isValidUrl('mine.github.yo')
    expect(isValid).toBe(true)
  })
  it('detects some invalid url', () => {
    let isValid = isValidUrl('{"content":"json"}')
    expect(isValid).toBe(false)
    isValid = isValidUrl('content: yaml')
    expect(isValid).toBe(false)
    isValid = isValidUrl('strangecontent')
    expect(isValid).toBe(false)
  })
})

describe('definition.downloadFileContent', () => {
  it('return available file content', async () => {
    axios.get.mockImplementation(() =>
      Promise.resolve({ data: Buffer.from('TEST-CONTENT') })
    )

    const reply = await downloadFileContent('my-test-url')
    expect(axios.get).toHaveBeenCalledWith(`my-test-url`, expect.any(Object))
    expect(reply).toBe('TEST-CONTENT')
  })

  it('return nothing on not available url', async () => {
    const mockError = new Error()
    axios.get.mockImplementation(() => Promise.reject(mockError))
    const reply = await downloadFileContent('my-test-url')
    expect(reply).toBe(null)
  })
})

describe('definition.readFileContent', () => {
  it('return available file content', async () => {
    fs.access.mockImplementation(() => Promise.resolve())
    fs.readFile.mockImplementation(() =>
      Promise.resolve(Buffer.from('TEST-CONTENT'))
    )

    const reply = await readFileContent('my-test-file')
    expect(fs.access).toHaveBeenCalledWith('my-test-file', expect.any(Number))
    expect(fs.readFile).toHaveBeenCalledWith('my-test-file')
    expect(reply).toBe('TEST-CONTENT')
  })

  it('return nothing on not existing file', async () => {
    const mockError = new Error()
    fs.access.mockImplementation(() => Promise.reject(mockError))
    const reply = await readFileContent('my-test-file')
    expect(reply).toBe(null)
  })
})

describe('definition.load', () => {
  it('return object content on valid url to json file', async () => {
    axios.get.mockImplementation(() =>
      Promise.resolve({ data: Buffer.from('{"testkey": "testvalue"}') })
    )

    const reply = await load('www.github.com')
    expect(reply).toMatchObject({ testkey: 'testvalue' })
  })

  it('return object content on valid url to yaml file', async () => {
    axios.get.mockImplementation(() =>
      Promise.resolve({ data: Buffer.from('testkey: testvalue') })
    )

    const reply = await load('www.github.com')
    expect(reply).toMatchObject({ testkey: 'testvalue' })
  })

  it('return nothing on valid url to unmanaged file format', async () => {
    axios.get.mockImplementation(() =>
      Promise.resolve({ data: Buffer.from('asd : fgh : ghj') })
    )

    const reply = await load('www.github.com')
    expect(reply).toBeNull()
  })

  it('return object content on valid path to json file', async () => {
    fs.access.mockImplementation(() => Promise.resolve())
    fs.readFile.mockImplementation(() =>
      Promise.resolve(Buffer.from('{"testkey": "testvalue"}'))
    )

    const reply = await load('./myfile.tt')
    expect(reply).toMatchObject({ testkey: 'testvalue' })
  })

  it('return object content on valid path to yaml file', async () => {
    fs.access.mockImplementation(() => Promise.resolve())
    fs.readFile.mockImplementation(() =>
      Promise.resolve(Buffer.from('testkey: testvalue'))
    )

    const reply = await load('./myfile.tt')
    expect(reply).toMatchObject({ testkey: 'testvalue' })
  })

  it('return nothing on valid path to unmanaged file format', async () => {
    fs.access.mockImplementation(() => Promise.resolve())
    fs.readFile.mockImplementation(() =>
      Promise.resolve(Buffer.from('asd : fgh : ghj'))
    )

    const reply = await load('./myfile.tt')
    expect(reply).toBeNull()
  })

  it('return object content on valid direct json input', async () => {
    const mockError = new Error()
    fs.access.mockImplementation(() => Promise.reject(mockError))

    const reply = await load('{"testkey": "testvalue", "testempty": null}')
    expect(reply).toMatchObject({ testkey: 'testvalue', testempty: null })
  })

  it('return object content on valid direct yaml input', async () => {
    const mockError = new Error()
    fs.access.mockImplementation(() => Promise.reject(mockError))
    const reply = await load(`
    testkey: testvalue1
    testempty:
    testthird: value3
    `)
    expect(reply).toMatchObject({
      testkey: 'testvalue1',
      testempty: null,
      testthird: 'value3'
    })
  })

  it('return nothing on direct uinput unmanaged format', async () => {
    const mockError = new Error()
    fs.access.mockImplementation(() => Promise.reject(mockError))

    const reply = await load('asd : fgh : ghj')
    expect(reply).toBeNull()
  })
})
