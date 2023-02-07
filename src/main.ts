import * as core from '@actions/core'
import * as io from '@actions/io'
import * as path from 'path'

export function dist_dir(): string {
  const root = path.dirname(path.dirname(__filename))
  return path.join(root, `dist`)
}

function github_workspace(): string {
  const workspace = process.env.GITHUB_WORKSPACE
  if (workspace === undefined) {
    throw new Error(`process.env.GITHUB_WORKSPACE is undefined`)
  }
  return workspace
}

export async function run(): Promise<void> {
  try {
    const dest: string = core.getInput('project_path')

    const options = {recursive: true, force: false}
    await io.cp(
      path.join(dist_dir(), 'UnityProject~'),
      path.join(github_workspace(), dest),
      options
    )

    core.setOutput('created_project_path', dest)
    core.exportVariable('created_project_path', dest)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
