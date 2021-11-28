import { ESLint, RuleTester } from 'eslint'

const tests = {
    valid: `
    function Component() {
        return (
            <Fragment>
                <p
                    className='block w-[340px] sm:h-[60em] w-full py-2 mt-8 text-sm font-semibold text-center text-white bg-gray-900 border border-black rounded-md hover:bg-gray-700 disabled:bg-gray-900 hover:cursor-pointer disabled:opacity-60'
                />
            </Fragment>
        )
    }
    `,
    withManyClassnames: `
    function Component() {
        return (
            <Fragment>
                <p className='block w-[340px] sm:h-[60em] w-full py-2 mt-8 text-sm font-semibold text-center text-white bg-gray-900 border border-black rounded-md hover:bg-gray-700 disabled:bg-gray-900 hover:cursor-pointer disabled:opacity-60' />
                <p className='block w-[340px] sm:h-[60em] w-full py-2 mt-8 text-sm font-semibold text-center text-white bg-gray-900 border border-black rounded-md hover:bg-gray-700 disabled:bg-gray-900 hover:cursor-pointer disabled:opacity-60' />
            </Fragment>
        )
    }
    
    `,
    withImports: `
    import { Fragment } from 'react'
    function Component() {
        return (
            <Fragment>
                <p
                    className='block w-[340px] sm:h-[60em] w-full py-2 mt-8 text-sm font-semibold text-center text-white bg-gray-900 border border-black rounded-md hover:bg-gray-700 disabled:bg-gray-900 hover:cursor-pointer disabled:opacity-60'
                />
            </Fragment>
        )
    }
    `,
}

describe('test eslint', () => {
    const eslint = new ESLint({
        overrideConfig: {
            plugins: ['short-classnames'],
            rules: {
                'short-classnames/short-classnames': 'error',
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
    for (let testName in tests) {
        test(`${testName}`, async () => {
            const code = tests[testName]

            const result = await eslint.lintText(code, { filePath: 'test.js' })

            // expect(result).toMatchSnapshot()
            if (result[0]?.messages.length > 0) {
                let fixedCode = result[0].source
                for (let message of result[0].messages) {
                    if (message.fix) {
                        fixedCode = replaceRange(
                            fixedCode,
                            message.fix.range[0],
                            message.fix.range[1],
                            message.fix.text,
                        )
                    }
                }
                console.log(fixedCode)
                expect(fixedCode).toMatchSnapshot('fixed')
            }
        })
    }
})

function replaceRange(s, start, end, substitute) {
    return s.substring(0, start) + substitute + s.substring(end)
}
