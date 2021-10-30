import path from 'path'
import fs from 'fs'

import { transformer, DEFAULT_JSC_OPTIONS, splitClassNames } from '.'
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
