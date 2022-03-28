import { Rule } from 'eslint'
import path from 'path'
import { rule } from './rules/rule'

const plugin = {
    rules: {
        'split-classnames': rule,
    },

    configs: {
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
        config: {
            plugins: ['split-classnames'],
            rules: {
                'split-classnames/split-classnames': 'error',
            },
        },
    },
}
export default plugin
module.exports = plugin
