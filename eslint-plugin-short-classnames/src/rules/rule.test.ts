import { ESLint, RuleTester } from 'eslint'
import { runRule } from './utils'

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
}

describe('test eslint', () => {
    for (let testName in tests) {
        test(`${testName}`, async () => {
            const code = tests[testName]
            console.log('code', code)
            const fixedCode = await runRule(code)
            console.log(fixedCode)

            expect(fixedCode).toMatchSnapshot('fixed')
        })
    }
})
