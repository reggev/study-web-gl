const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    historyApiFallback: true,
    compress: true,
  },
  devtool: 'source-map',
  plugins: [new HtmlWebpackPlugin({title: 'WebGL Study'})],
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: ['ts-loader'],
      },
      {
        test: /\.glsl$/,
        use: 'webpack-glsl-loader',
      },
      {
        test: /\.s?[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        exclude: /\module.s?[ac]ss$/i,
      },
      {
        test: /\module.s?[ac]ss$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      assets: path.resolve(__dirname, 'public'),
    },
  },
}
