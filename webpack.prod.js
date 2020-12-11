const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const PATHS = {
    root: path.join(__dirname, '/'),
    src: path.join(__dirname, '/src'),
    dist: path.join(__dirname, '/dist'),
};

let config = {

    mode: 'production',

    entry: {
        home: './src/scripts/home.js',
        game: './src/scripts/game.js'
    },

    output: {
      path: PATHS.dist,
      filename: 'scripts/[name].js'
    },

    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader',
                options: {
                  attrs: [":src"]
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
              },
            {
                test: /\.sass$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', {
                    loader: 'postcss-loader',
                    options: {
                        config: {
                            ctx: {
                                env: 'production'
                            }
                        }
                    }
                }, 'sass-loader']
            },
      // {
      //   test: /\.(jpe?g|png|gif|svg)$/,
      //   loader: 'url-loader',
      //   options: {
      //     limit: 8000,
      //     name: 'assets/images/[hash]-[name].[ext]',
      //     esModule: false
      //   }
      // },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/images/[name].[hash:6].[ext]',
              emitFile: true,
              enforce: 'pre',
              esModule: false,
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.90],
                speed: 4
              },
              gifsicle: {
                interlaced: false,
              },
              webp: {
                quality: 75
              },
            },
          },
        ],
      },
      {
        test: /\.(mov|mp4)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'assets/videos/',
          esModule: false,
        }
      },
      {
        test: /\.(woff(2)?|ttf|eot|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/fonts/',
              esModule: false,
            },
          }
        ]
      },
      {
        test: /\.(handlebars|hbs)$/, loader: "handlebars-loader"
      },
        ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        hash: true,
        title: 'Home | WorldMapQuiz',
        template: './src/home.html',
        chunks: ['home'],
        filename: 'index.html'
      }),
      new HtmlWebpackPlugin({
        hash: true,
        title: 'Game | WorldMapQuiz',
        template: './src/game.html',
        chunks: ['game'],
        filename: 'game.html'
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css'
      })
    ]
};

module.exports = config;