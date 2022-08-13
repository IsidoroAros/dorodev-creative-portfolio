const path = require('path')
const webpack = require('webpack')

// Plugin to remove unnecessary files for production build
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// Plugin to resolve copies of files
const CopyWebpackPlugin = require('copy-webpack-plugin')
// Plugin to output an unique css file
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// Plugin to resolve image minimization
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
// Plugin to improve files minification
const TerserPlugin = require('terser-webpack-plugin')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const IS_DEVELOPMENT = (process.env.NODE_END = 'dev')

// Saves the path of the specified directories
const dirApp = path.join(__dirname, 'app')
const dirShared = path.join(__dirname, 'shared')
const dirStyles = path.join(__dirname, 'styles')
const dirNode = 'node_modules'

module.exports = {
  // Entry point of the application
  entry: [path.join(dirApp, 'index.js'), path.join(dirStyles, 'index.scss')],
  resolve: {
    modules: [dirApp, dirShared, dirStyles, dirNode]
  },

  // Plugins the app depends on
  plugins: [

    new webpack.DefinePlugin({
      IS_DEVELOPMENT
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: './shared',
          to: ''
        }
      ]
    }),

    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),

    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminMinify,
        options: {
          // Lossless optimization with custom option
          // Feel free to experiment with options for better result for you
          plugins: [
            ['gifsicle', { interlaced: true }],
            ['jpegtran', { progressive: true }],
            ['optipng', { optimizationLevel: 8 }]
          ]
        }
      }
    }),

    new HtmlWebpackPlugin({
      template: path.join(dirApp, 'index.html')
    }),

    new CleanWebpackPlugin()

  ],

  module: {
    // Rules for modules (configure loaders, parser options, etc...)
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        },
        options: {
          presets: ['@babel/preset-env',
            ['@babel/preset-react',
              {
                pragma: 'dom',
                pragmaFrag: 'DomFrag', // default is React.Fragment (only in classic runtime)
                throwIfNamespace: false, // defaults to true
                runtime: 'automatic', // defaults to classic
                importSource: 'custom-jsx-library' // defaults to react (only in automatic runtime)
              }
            ]]
        }
      },

      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: ''
            }
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      },

      {
        test: /\.(png|jpg|gif|svg|woff|woff2|fnt|webp)$/,
        loader: 'file-loader',
        options: {
          // Defines where test files are outputted
          outputPath: 'images',
          // when copying images, the name of the file is a hash of the original file name
          name (file) {
            return '[hash].[ext]'
          }
        }
      },

      {
        test: /\.(jpe?g|png|gif|svg|webp)$/i,
        use: [
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                  plugins: [
                    'imagemin-gifsicle',
                    'imagemin-mozjpeg',
                    'imagemin-pngquant',
                    'imagemin-svgo'
                  ]
                }
              }
            }
          }
        ]
      },

      {
        test: /\.(glsl|frag|vert)$/,
        loader: 'raw-loader',
        exclude: /node_modules/
      },

      {
        test: /\.(glsl|frag|vert)$/,
        loader: 'glslify-loader',
        exclude: /node_modules/
      }
    ]
  },

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()]
  }
}
