// metro.config.js
const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config'); // This is fine as it's typically CommonJS

const root = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
module.exports = (async () => {
  // Wrap in an async IIFE
  // Dynamically import react-native-monorepo-config as it's an ES Module
  const { withMetroConfig } = await import('react-native-monorepo-config');

  const config = await getDefaultConfig(__dirname); // Await getDefaultConfig

  return withMetroConfig(config, {
    // Pass the awaited config
    root,
    dirname: __dirname,
  });
})(); // End of async IIFE
