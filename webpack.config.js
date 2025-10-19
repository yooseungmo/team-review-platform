const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = function (options) {
  return {
    ...options,
    resolve: {
      ...(options.resolve || {}),
      plugins: [
        ...(options.resolve?.plugins || []),
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, 'tsconfig.json'),
        }),
      ],
    },
    devtool: 'source-map',
  };
};
