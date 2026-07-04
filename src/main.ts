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

function setStandalone(content: string, key: string, value: string): string {
  if (value === '') return content // keep template value; empty replacement would corrupt YAML (`Standalone: `)
  const regex = new RegExp(`(${key}: *\\n *Standalone: )\\d+`)
  return content.replace(regex, (_match, prefix) => `${prefix}${value}`)
}

export async function run(): Promise<void> {
  try {
    // Copy Unity project files
    const dest: string = core.getInput('project-path')
    const options = {recursive: true, force: false}
    const targetPath = path.join(github_workspace(), dest)
    const templatePath = path.join(dist_dir(), 'UnityProject~')

    if (dest === '.' || dest === './') {
      // Copy contents of UnityProject~ into the workspace root
      const entries = await fs.readdir(templatePath)
      for (const name of entries) {
        const src = path.join(templatePath, name)
        const dst = path.join(targetPath, name)
        await io.cp(src, dst, options)
      }
    } else {
      // Ensure parent directory exists before copying the template folder
      await io.mkdirP(path.dirname(targetPath))
      await io.cp(templatePath, targetPath, options)
    }

    // Set options
    const projectSettingsPath = path.join(
      targetPath,
      'ProjectSettings',
      'ProjectSettings.asset'
    )
    let content = await fs.readFile(projectSettingsPath, 'utf8')
    content = setStandalone(
      content,
      'scriptingBackend',
      core.getInput('scripting-backend')
    )
    content = setStandalone(
      content,
      'il2cppCodeGeneration',
      core.getInput('il2cpp-code-generation')
    )
    content = setStandalone(
      content,
      'managedStrippingLevel',
      core.getInput('managed-stripping-level')
    )
    // Note: "activeInputHandler" does not exist in the template's ProjectSettings.asset, so it is appended
    content += `  activeInputHandler: ${core.getInput(
      'active-input-handler'
    )}\n`
    await fs.writeFile(projectSettingsPath, content)

    // Outputs
    core.setOutput('created-project-path', dest)
    core.exportVariable('CREATED_PROJECT_PATH', dest)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
