import { Rule } from 'eslint'
import { rule } from './rules/rule'

const plugin = {
    rules: {
        'short-classnames': rule,
    },

    configs: {
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
        config: {
            plugins: ['short-classnames'],
            rules: {
                'short-classnames/short-classnames': 'error',
            },
        },
    },
}
export default plugin
module.exports = plugin
