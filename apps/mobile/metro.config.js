const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// 1. Get the absolute path to the project workspace root
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

// 2. Get the default config
const config = getDefaultConfig(projectRoot);

// 3. Force Metro to resolve (sub)dependencies from the `node_modules`
//    of the workspace root, as well as the project root.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

// 4. Apply NativeWind with explicit config path
module.exports = withNativeWind(config, { 
    input: './global.css',
    configPath: path.resolve(__dirname, 'tailwind.config.js')
});
