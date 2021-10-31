import yargs, { CommandModule } from 'yargs'
import fs from 'fs'
import path from 'path'
import { globWithGit } from 'smart-glob'
import { transformSource } from './index'

export async function runCodemod({ glob, dryRun = false }) {
    const files = await globWithGit(glob, {
        absolute: true,
        gitignore: true,
        ignoreGlobs: ['**/node_modules/**', '**/dist/**'],
    })

    const results: string[] = []
    for (let file of files) {
        let source = (await fs.promises.readFile(file)).toString()
        if (file.endsWith('.d.ts')) {
            continue
        }
        const ext = path.extname(file)
        console.info(`=> ${dryRun ? 'Processing' : 'Applying to'} [${file}]`)
        source = transformSource(source, {})
        results.push(source)
        if (!dryRun) {
            await fs.promises.writeFile(file, source, { encoding: 'utf-8' })
        }
    }
    return results
}

const codemodCommand: CommandModule = {
    command: ['* <glob>'],
    describe: 'Split long classnames',
    builder: (argv) => {
        argv.option('dry', {
            type: 'boolean',
            required: false,
            description: 'only show what files would be changed',
        })
        return argv
    },
    handler: async (argv: any) => {
        const glob = argv.glob
        if (!glob) {
            throw new Error('missing required positional argument glob')
        }
        await runCodemod({
            glob,
            dryRun: argv.dry,
        })
    },
}

yargs
    .scriptName('classnames')
    .locale('en')
    .command(codemodCommand)
    .help('help', 'h').argv
