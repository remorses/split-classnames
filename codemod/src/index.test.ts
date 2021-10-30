import path from 'path'
import fs from 'fs'

import { transformer, DEFAULT_JSC_OPTIONS } from '.'
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
