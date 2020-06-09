import { resolve } from 'path'

import { Package } from '@siroc/core'
import { bold, gray } from 'chalk'
import consola from 'consola'
import { existsSync } from 'fs-extra'

interface RunCommandOptions {
  file: string
  args: string[]
  options: {
    workspaces?: boolean
  }
}

export async function run({
  file,
  args,
  options: { workspaces },
}: RunCommandOptions) {
  const fullCommand = `${file} ${args.join()}`.trim()
  const filepath = resolve(process.cwd(), file)
  const isLocalFile =
    (file.endsWith('.js') || file.endsWith('.ts')) && existsSync(filepath)

  function runCommand(pkg: Package) {
    try {
      const { stdout } = isLocalFile
        ? pkg.exec('yarn', `siroc-runner ${filepath} ${args.join()}`, true)
        : pkg.exec(file, args.join(), true)
      consola.success(
        `Ran ${bold(fullCommand)} in ${bold(pkg.pkg.name)}.`,
        stdout ? '\n' : '',
        stdout ? gray(stdout) : ''
      )
    } catch (e) {
      consola.error(`Error running ${bold(fullCommand)}\n`, gray(e))
    }
  }

  const rootPackage = new Package()

  const packages = workspaces
    ? await rootPackage.getWorkspacePackages()
    : [rootPackage]

  packages.forEach(pkg => runCommand(pkg))
}