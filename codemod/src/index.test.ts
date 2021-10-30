import path from 'path'
import fs from 'fs'

import { transformer, DEFAULT_JSC_OPTIONS, splitClassNames } from './transformer'
import { applyTransform } from 'jscodeshift/dist/testUtils'

for (let testName of fs.readdirSync(path.join(__dirname, 'examples'))) {
    const testFile = path.resolve(__dirname, 'examples', testName)
    const source = fs.readFileSync(testFile, 'utf8').toString()
    test(testName, () => {
        const res = applyTransform(
            transformer,
            DEFAULT_JSC_OPTIONS,
            {
                source,
            },
            DEFAULT_JSC_OPTIONS,
        )
        if (process.env.DEBUG) {
            console.log()
            console.log(res)
            console.log()
        }
        expect(res).toMatchSnapshot(testName)
    })
}

test('splitClassNames keeps all classes', () => {
    const N = 8
    const expectedLen = 'something1'.length * N + (N - 1) * 1
    const cls = new Array(N)
        .fill('')
        .map((_, i) => `something${i}`)
        .join(' ')
    // console.log(cls)
    const res = splitClassNames(cls)
    // console.log(res)
    expect(res.join(' ').length).toBe(expectedLen)
})

test('splitClassNames makes small groups', () => {
    const N = 8
    const expectedLen = 'something1'.length * N + (N - 1) * 1
    const cls = new Array(N)
        .fill('')
        .map((_, i) => `something${i}`)
        .join(' ')
    // console.log(cls)
    const res = splitClassNames(cls, 'something1'.length)
    expect(res.length).toBe(N)
    expect(res.join(' ').length).toBe(expectedLen)
})
test('splitClassNames sorts classes for tailwind', () => {
    const cls =
        'w-1 w-[700px] hover:h-[800px] text-gray-800 hover:text-gray-800 dark:w-5 h-xl absolute relative disabled:w-8 text-white text-black'
    // console.log(cls)
    const res = splitClassNames(cls, 60)

    expect(JSON.stringify(res)).toBe(
        JSON.stringify([
            'w-1 text-gray-800 h-xl absolute relative text-white text-black w-[700px]',
            'disabled:w-8 dark:w-5 hover:text-gray-800 hover:h-[800px]',
        ]),
    )
})
