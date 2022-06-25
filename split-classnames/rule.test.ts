import { ESLint, RuleTester } from 'eslint'
import { runRule } from 'eslint-plugin-split-classnames/src/utils'
import { test, describe, expect } from 'vitest'

const tests = {
    simple: `
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
    withTypescript: `
    function Component(x: SomeType) {
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
    withTemplateLiteral: `
    import { Fragment } from 'react'
    function Component() {
        return (
            <Fragment>
                <p
                    className={\`color classe foo \${true ? 'hello' : 'hi'} something py-2 mt-8 text-sm font-semibold text-center text-white\`}
                />
            </Fragment>
        )
    }
    `,
    callArgumentTooLong: `
    import { Fragment } from 'react'
    import cs from 'classnames'
    function Component() {
        return (
            <Fragment>
                <p
                    className={cs('color classe foo something py-2 mt-8 text-sm font-semibold text-center text-white', true ? 'hello' : 'hi', 'something else')}
                />
            </Fragment>
        )
    }
    `,
    withCsImport: `
    import { Fragment } from 'react'
    import cs from 'classnames'
    function Component() {
        return (
            <Fragment>
                <p
                    className={'color classe foo something py-2 mt-8 text-sm font-semibold text-center text-white'}
                />
            </Fragment>
        )
    }
    `,
    alreadySplitted: `
    import { Fragment } from 'react'
    import cs from 'classnames'
    function Component() {
        return (
            <Fragment>
                <p
                    className={cs(
                        'color classe foo something py-2 mt-8 text-sm font-semibold',
                        'text-center text-white',
                        true ? 'hello' : 'hi',
                        'something else',
                        'wow so many',
                    )}
                />
            </Fragment>
        )
    }
    `,
    shouldNotRun: `
    import cs from 'classnames';
    function Component() {
    return (
            <Fragment>
            <p
                className={cs(
                'color classe foo something py-2 mt-8 text-sm font-semibold',
                'text-center text-white something else wow so many',
                true ? 'hello' : 'hi'
                )}
            />
            </Fragment>
        );
    }
    `,
    regression1: `
    import cs from 'classnames';
    function Component() {
    return (
            <Fragment>
            <p
                className={cs(
                    'appearance-none max-w-max flex whitespace-pre-wrap text-gray-700',
                    'pt-[1em] hover:underline dark:text-gray-100 first:pt-0',
                    hClasses[level] || '',
                    className,
                )}
            />
            </Fragment>
        );
    }
    `,
}

import prettier from 'prettier'

describe('test eslint', () => {
    for (let testName in tests) {
        test(`${testName}`, async () => {
            const code = tests[testName]
            // console.log('code', code)
            let fixedCode = await runRule(code)
            let prettyFixedCode =
                fixedCode &&
                prettier.format(fixedCode, {
                    singleQuote: true,
                    parser: 'babel',
                })
            // console.log(fixedCode)

            expect(prettyFixedCode).toMatchSnapshot('fixed')
            let fixedCodeAgain = (await runRule(fixedCode)) || fixedCode || code
            expect(fixedCodeAgain.trim()).toBe(fixedCode.trim())
        })
    }
})
