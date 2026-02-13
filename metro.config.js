const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    resolver: {
        unstable_enablePackageExports: true,
        extraNodeModules: {
            crypto: path.resolve(__dirname, 'empty-module.js'),
            stream: path.resolve(__dirname, 'empty-module.js'),
            http: path.resolve(__dirname, 'empty-module.js'),
            https: path.resolve(__dirname, 'empty-module.js'),
            os: path.resolve(__dirname, 'empty-module.js'),
            url: path.resolve(__dirname, 'empty-module.js'),
        },
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
