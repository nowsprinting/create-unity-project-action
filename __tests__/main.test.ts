import {dist_dir} from '../src/main'
import {run} from '../src/main'
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
  await io.rmRF(test_dir())
})

test(`test dist_dir()`, () => {
  const actual = dist_dir()
  expect(actual.substring(actual.length - 5)).toEqual(`/dist`)
})

test('test runs', async () => {
  const project_path = 'test2/testProject~'

  process.env['INPUT_PROJECT_PATH'] = project_path
  process.env['GITHUB_WORKSPACE'] = test_dir()

  const spy = jest.spyOn(core, 'setOutput')
  await run()

  expect(fs.existsSync(path.join(test_dir(), project_path))).toEqual(true)
  expect(spy).toHaveBeenCalledWith('created_project_path', project_path)
  expect(process.env.created_project_path).toEqual(project_path)
})
