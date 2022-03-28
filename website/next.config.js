const withTM = require('next-transpile-modules')([])

/** @type {import('next').NextConfig} */
const config = {
    webpack(config) {
        config.externals = config.externals.concat([
            '_http_common',
            'flow-parser',
        ])
        return config
    },
    
}

module.exports = withTM(config)
