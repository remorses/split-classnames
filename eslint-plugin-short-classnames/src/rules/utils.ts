import { ESLint } from 'eslint'

let eslint: ESLint
export async function runRule(code: string) {
    if (!eslint) {
        eslint = new ESLint({
            overrideConfig: {
                plugins: ['short-classnames'],
                parser: '@typescript-eslint/parser',
                rules: {
                    'short-classnames/short-classnames': [
                        'error',
                        { maxClassNameCharacters: 30 },
                    ],
                },
                parserOptions: {
                    ecmaVersion: 2018,

                    sourceType: 'module',
                    ecmaFeatures: {
                        jsx: true,
                    },
                },
            },
        })
    }
    const result = await eslint.lintText(code, { filePath: 'test.tsx' })

    if (!result[0]?.messages?.length) {
        return ''
    }
    let fixedCode = result[0].source
    let incrementRanges = 0
    for (let message of result[0].messages) {
        if (message.fix) {
            fixedCode = replaceRange(
                fixedCode,
                message.fix.range[0] + incrementRanges,
                message.fix.range[1] + incrementRanges,
                message.fix.text,
            )
            incrementRanges +=
                message.fix.text.length -
                (message.fix.range[1] - message.fix.range[0])
        }
    }
    return fixedCode
}

function replaceRange(s, start, end, substitute) {
    return s.substring(0, start) + substitute + s.substring(end)
}
