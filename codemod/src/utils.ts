import memoize from 'micro-memoize'
import prettier from 'prettier'

export function jscodeshiftToPrettierParser(parser) {
    const parserMap = {
        babylon: 'babel',
        flow: 'flow',
        ts: 'typescript',
        tsx: 'typescript',
    }

    return parserMap[parser] || 'babel'
}

export function warn(x) {
    return console.error('WARNING', x)
}

export const getPrettierConfig = memoize(() => {
    const prettierConfig = prettier.resolveConfig.sync('.', {
        editorconfig: true,
    }) || {
        printWidth: 100,
        tabWidth: 2,
        bracketSpacing: true,
        trailingComma: 'es5',
        singleQuote: true,
    }
    return prettierConfig
})

export function prettify(source) {
    const config = getPrettierConfig()
    if (!config) {
        console.warn(`Skipping code formatting as prettier config cannot be found`)
    }
    return prettier.format(source, {
        ...config,
        parser: 'typescript',
    })
}
