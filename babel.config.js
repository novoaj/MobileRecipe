module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    env: {
      production: {
        plugins: [['module:react-native-dotenv']]
      },
      development: {
        plugins: [['module:react-native-dotenv']]
      }
    }
  };
};
