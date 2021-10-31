import { applyTransform } from 'jscodeshift/dist/testUtils'
import { transformer } from './transformer'
import _jscodeshift from 'jscodeshift'

export function transformSource(source: string, options = {}) {
    const jscodeshift = _jscodeshift.withParser('tsx')
    const res = transformer({ source }, { jscodeshift }, { ...options })
    return res
}
