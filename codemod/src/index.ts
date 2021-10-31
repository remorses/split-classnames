import { applyTransform } from 'jscodeshift/dist/testUtils'
import { transformer } from './transformer'
import _jscodeshift from 'jscodeshift'

export function transformSource(source: string, options = {}) {
    const jscodeshift = _jscodeshift.withParser('tsx')
    const res = transformer({ source }, { jscodeshift }, { ...options })
    return res
}

export function transformUsingRegex(source: string, options = {}) {
    const regexAllTags = /<([a-zA-Z1-6]+)([^<]+)(?:>|\/>)/gim
    let jsxTagMatch: RegExpExecArray | null
    const results: { start: number; end: number; str: string }[] = []
    while ((jsxTagMatch = regexAllTags.exec(source)) !== null) {
        if (!jsxTagMatch[0].trim()) {
            continue
        }
        const jsxTag = jsxTagMatch[0]
        const isOpeningTag = !jsxTag.match(/\/>$/)?.length
        const withClosingTag = isOpeningTag
            ? jsxTag.replace(/>(\s*)$/, '/>$1')
            : jsxTag
        try {
            // console.log('match [' + jsxTag + ']')
            let res = transformSource(withClosingTag, {
                skipImportDeclaration: true,
            })
            if (isOpeningTag) {
                res = res.replace(/\/>(\s)$/, '>$1')
            }
            results.push({
                start: jsxTagMatch.index,
                end: jsxTagMatch.index + jsxTag.length,
                str: res,
            })
            // console.log('transformed', res)
        } catch (e) {
            // console.log('error at', withClosingTag, e)
            throw e
        }
    }
    return results
}
