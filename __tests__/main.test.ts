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
})

test(`test dist_dir()`, () => {
  const actual = dist_dir()
  expect(actual.substring(actual.length - 5)).toEqual(`/dist`)
})

test('test copy project files', async () => {
  const project_path = 'test2/testProject~'

  process.env['INPUT_PROJECT-PATH'] = project_path
  process.env['GITHUB_WORKSPACE'] = test_dir()

  const spy = jest.spyOn(core, 'setOutput')
  await run()

  expect(fs.existsSync(path.join(test_dir(), project_path))).toEqual(true)
  expect(spy).toHaveBeenCalledWith('created-project-path', project_path)
  expect(process.env.CREATED_PROJECT_PATH).toEqual(project_path)
})

test('test copy project files when project-path is `.`', async () => {
  const project_path = '.'

  process.env['INPUT_PROJECT-PATH'] = project_path
  process.env['GITHUB_WORKSPACE'] = test_dir()

  const spy = jest.spyOn(core, 'setOutput')
  await run()

  const ProjectSettingsPath = path.join(
    test_dir(),
    'ProjectSettings',
    'ProjectSettings.asset'
  )
  expect(fs.existsSync(ProjectSettingsPath)).toEqual(true)

  expect(spy).toHaveBeenCalledWith('created-project-path', project_path)
  expect(process.env.CREATED_PROJECT_PATH).toEqual(project_path)
})

test('test set activeInputHandler', async () => {
  const project_path = 'test2/testProject~'

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
})

test('test set activeInputHandler when project-path is `.`', async () => {
  const project_path = '.'

  process.env['INPUT_PROJECT-PATH'] = project_path
  process.env['INPUT_ACTIVE-INPUT-HANDLER'] = '2'
  process.env['GITHUB_WORKSPACE'] = test_dir()

  await run()

  const actualPath = path.join(
    test_dir(),
    'ProjectSettings',
    'ProjectSettings.asset'
  )
  const actual = fs.readFileSync(actualPath, 'utf8')
  expect(actual).toEqual(expect.stringContaining('activeInputHandler: 2'))
})
