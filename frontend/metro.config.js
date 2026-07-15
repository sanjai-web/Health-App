const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Firebase JS SDK uses .cjs files, configure Metro to support them
config.resolver.sourceExts.push('cjs');

// Disable package exports to prevent module resolution conflicts with Firebase
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: "./global.css" });
