#!/usr/bin/env zx

import { build } from 'esbuild'
import fs from 'fs'

async function main() {
    const result = await build({
        entryPoints: ['src/extension.ts'],
        bundle: true,
        // splitting: true,
        format: 'cjs',
        external: ['vscode', 'flow-parser'],
        plugins: [
            {
                name: 'flow-parser',
                setup(build) {
                    build.onResolve({ filter: /^flow-parser$/ }, (args) => ({
                        path: args.path,
                        namespace: 'flow-parser',
                    }))

                    build.onLoad(
                        { filter: /.*/, namespace: 'flow-parser' },
                        () => ({
                            contents: `module.exports = {parser: () => ''};`,
                            loader: 'js',
                        }),
                    )
                },
            },
        ],
        platform: 'node',
        target: 'node12',
        metafile: true,
        sourcemap: true,
        outfile: 'dist/extension.js',
    })
    require('fs').writeFileSync(
        'dist/meta.json',
        JSON.stringify(result.metafile),
    )
}

main()
