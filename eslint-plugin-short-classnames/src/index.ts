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
    },
}
export default plugin
module.exports = plugin
