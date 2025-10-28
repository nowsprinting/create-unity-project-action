import * as core from '@actions/core'
import * as io from '@actions/io'
import * as path from 'path'
import * as fs from 'fs/promises'

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
    // Copy Unity project files
    const dest: string = core.getInput('project-path')
    const options = {recursive: true, force: false}
    const targetPath = path.join(github_workspace(), dest)
    await io.cp(path.join(dist_dir(), 'UnityProject~'), targetPath, options)

    // Set options
    const projectSettingsPath = path.join(
      targetPath,
      'ProjectSettings',
      'ProjectSettings.asset'
    )
    await fs.appendFile(
      projectSettingsPath,
      `  activeInputHandler: ${core.getInput('active-input-handler')}\n`
    )
    // Note: "activeInputHandler" does not exist in the template's ProjectSettings.asset

    // Outputs
    core.setOutput('created-project-path', dest)
    core.exportVariable('CREATED_PROJECT_PATH', dest)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
