import {dist_dir, run} from '../src/main'
import * as core from '@actions/core'
import * as io from '@actions/io'
import * as process from 'process'
import * as path from 'path'
import * as fs from 'fs'
import {expect, test} from '@jest/globals'

function test_dir(): string {
  const root = path.dirname(path.dirname(__filename))
  return path.join(root, `test`)
}

beforeEach(async () => {
  const dir = test_dir()
  await io.rmRF(dir)
  await io.mkdirP(dir)
  delete process.env['INPUT_ACTIVE-INPUT-HANDLER']
  delete process.env['INPUT_SCRIPTING-BACKEND']
  delete process.env['INPUT_IL2CPP-CODE-GENERATION']
  delete process.env['INPUT_MANAGED-STRIPPING-LEVEL']
})

test(`test dist_dir()`, () => {
  const actual = dist_dir()
  expect(actual.substring(actual.length - 5)).toEqual(`/dist`)
})

test.each(['test2/testProject~', '.'])(
  'test copy project files (project-path: %s)',
  async (project_path: string) => {
    process.env['INPUT_PROJECT-PATH'] = project_path
    process.env['GITHUB_WORKSPACE'] = test_dir()

    const spy = jest.spyOn(core, 'setOutput')
    await run()

    const projectSettingsPath = path.join(
      test_dir(),
      project_path,
      'ProjectSettings',
      'ProjectSettings.asset'
    )
    expect(fs.existsSync(projectSettingsPath)).toEqual(true)
    expect(spy).toHaveBeenCalledWith('created-project-path', project_path)
    expect(process.env.CREATED_PROJECT_PATH).toEqual(project_path)
  }
)

test.each(['test2/testProject~', '.'])(
  'test set activeInputHandler (project-path: %s)',
  async (project_path: string) => {
    process.env['INPUT_PROJECT-PATH'] = project_path
    process.env['INPUT_ACTIVE-INPUT-HANDLER'] = '2'
    process.env['GITHUB_WORKSPACE'] = test_dir()

    await run()

    const actualPath = path.join(
      test_dir(),
      project_path,
      'ProjectSettings',
      'ProjectSettings.asset'
    )
    const actual = fs.readFileSync(actualPath, 'utf8')
    expect(actual).toEqual(expect.stringContaining('activeInputHandler: 2'))
  }
)

test('test set scripting-backend', async () => {
  const project_path = 'test2/testProject~'

  process.env['INPUT_PROJECT-PATH'] = project_path
  process.env['INPUT_SCRIPTING-BACKEND'] = '1'
  process.env['GITHUB_WORKSPACE'] = test_dir()

  await run()

  const actualPath = path.join(
    test_dir(),
    project_path,
    'ProjectSettings',
    'ProjectSettings.asset'
  )
  const actual = fs.readFileSync(actualPath, 'utf8')
  expect(actual).toEqual(
    expect.stringContaining('scriptingBackend:\n    Standalone: 1')
  )
})

test('test set il2cpp-code-generation', async () => {
  const project_path = 'test2/testProject~'

  process.env['INPUT_PROJECT-PATH'] = project_path
  process.env['INPUT_IL2CPP-CODE-GENERATION'] = '1'
  process.env['GITHUB_WORKSPACE'] = test_dir()

  await run()

  const actualPath = path.join(
    test_dir(),
    project_path,
    'ProjectSettings',
    'ProjectSettings.asset'
  )
  const actual = fs.readFileSync(actualPath, 'utf8')
  expect(actual).toEqual(
    expect.stringContaining('il2cppCodeGeneration:\n    Standalone: 1')
  )
})

test('test set managed-stripping-level', async () => {
  const project_path = 'test2/testProject~'

  process.env['INPUT_PROJECT-PATH'] = project_path
  process.env['INPUT_MANAGED-STRIPPING-LEVEL'] = '3'
  process.env['GITHUB_WORKSPACE'] = test_dir()

  await run()

  const actualPath = path.join(
    test_dir(),
    project_path,
    'ProjectSettings',
    'ProjectSettings.asset'
  )
  const actual = fs.readFileSync(actualPath, 'utf8')
  expect(actual).toEqual(
    expect.stringContaining('managedStrippingLevel:\n    Standalone: 3')
  )
})
