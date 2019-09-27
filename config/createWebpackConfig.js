const fs = require('fs-extra');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const nodeExternals = require('webpack-node-externals');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const paths = require('./paths');
const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const cssLoaderFunc = modules => ({
    loader: 'css-loader',
    options: {
        importLoaders: 1,
        // modules: modules,
        // localIdentName: modules ? '[name]__[local]__[hash:base64:10]' : undefined
    }
})

const cssLoader = cssLoaderFunc(true)
const postCssLoader = {
    loader: "postcss-loader",
    options: {
        ident: "postcss",
        plugins: () => [
            autoprefixer({
                browsers: [
                    ">1%",
                    "last 4 versions",
                    "Firefox ESR",
                    "not ie < 8"
                ]
            })
        ]
    }
};

module.exports = (target, env) => {

    const isDev = env === 'development';
    const isPro = env === 'production';
    const isWeb = target === 'web';
    const isNode = target === 'node';

    let config = {
        // Set webpack mode:
        mode: env,
        // Set webpack context to the current command's directory
        context: paths.rootPath,
        // Specify target (either 'node' or 'web')
        target,
        devtool: isDev ? 'cheap-source-map' : void 0,

        resolve: {
            extensions: ['.js', '.json', '.sass', '.scss', '.less', '.jsx'],
            alias: {
                '@': paths.app,
                '@scss': path.resolve(__dirname, '../src/app/assets/scss/'),
                '@api': path.resolve(__dirname, '../src/app/api'),
                '@containers': path.resolve(__dirname, '../src/app/containers'),
                '@components': path.resolve(__dirname, '../src/app/components')
            }
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: ['babel-loader']
                },
                {
                    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                    loader: require.resolve('url-loader'),
                    options: {
                        limit: 10000,
                        name: 'image/[name].[hash:8].[ext]',
                        emitFile: true,
                    },
                },
                // todo
                {
                    test: /\.(eot|woff|ttf|woff2|svg)$/,
                    use: 'url-loader'
                }
            ]
        },
        plugins: [],
    };

    if (isWeb) {
        config.output = {
            path: paths.build,
            filename: '[name]-[hash:8].js',
            chunkFilename: '[name].clientChunk.[chunkhash:6].js',
            libraryTarget: 'var',
            publicPath: '/',
        };
        config.module.rules.push(
            {
                // test: /\.css$/,
                test: /\.(c|le|sc)ss$/,
                include: /node_modules/,
                use: [
                    'style-loader',
                    {
                        loader: require.resolve('css-loader'),
                        // options: {
                        //     importLoaders: 1,
                        // },
                    },
                    postCssLoader,
                    "sass-loader"
                ]
            }
        );
        config.plugins.push(
            new AssetsPlugin({
                path: paths.build,
                filename: 'assets.json',
            })
        );
        if (isDev) {
            config.entry = {
                client: [
                    'babel-polyfill',
                    // 'react-hot-loader/patch',
                    'webpack-hot-middleware/client?reload=true&noInfo=false',
                    paths.appClientIndexJs
                ]
            };
            config.module.rules.push(
                {
                    test: /\.(c|le|sc)ss$/,
                    exclude: /node_modules/,
                    use: [
                        'style-loader',
                        {
                            loader: require.resolve('css-loader'),
                            options: {
                                modules: true,
                                localIdentName: '[name]-[local]-[hash:base64:5]',
                                importLoaders: 1
                            }
                        },
                        postCssLoader,
                        "sass-loader"
                    ]
                }
            );

            config.plugins.push(
                new webpack.NamedModulesPlugin(),
                new webpack.HotModuleReplacementPlugin(),
                new HtmlWebpackPlugin({
                    template: path.resolve(__dirname, 'template/index.html')
                }),
            );
        }
        else if (isPro) {
            config.entry = {
                client: ['babel-polyfill', paths.appClientIndexJs]
            };
            config.module.rules.push(
                {
                    test: /\.(c|le|sc)ss$/,
                    exclude: /node_modules/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: require.resolve('css-loader'),
                            // options: {
                            //     importLoaders: 1,
                            // },
                            options: {
                                modules: true,
                                localIdentName: '[name]-[local]-[hash:base64:5]',
                                importLoaders: 1
                            }
                        },
                        postCssLoader,
                        "sass-loader"
                    ]
                }
            );

            config.plugins.push(
                new webpack.HashedModuleIdsPlugin(),
                new MiniCssExtractPlugin({
                    filename: 'css/bundle.[contenthash:8].css',
                    chunkFilename: 'css/[name].[contenthash:8].chunk.css',
                    // allChunks: true because we want all css to be included in the main
                    // css bundle when doing code splitting to avoid FOUC:
                    // https://github.com/facebook/create-react-app/issues/2415
                    // allChunks: true,
                }),     
            );
        }
    }
    else if (isNode){
        config.entry = {
            server: ['babel-polyfill', paths.appServerIndexJs]
        };
        config.output = {
            path: paths.build,
            filename: 'server.js',
            publicPath: '/',
            chunkFilename: '[name].serverChunk.[chunkhash:6].js',
            libraryTarget: 'commonjs2',
        };

        config.externals = [
            nodeExternals({
                whitelist: [
                    // 'webpack/hot/poll?300',
                    /\.(eot|woff|woff2|ttf|otf)$/,
                    /\.(svg|png|jpg|jpeg|gif|ico)$/,
                    /\.(mp4|mp3|ogg|swf|webp)$/,
                    /\.(css|scss|sass|sss|less)$/,
                ].filter(x => x),
            }),
        ];
        config.module.rules.push(
            {
                test: /\.(c|le|sc)ss$/,
                // exclude: /node_modules/,
                use: [
                    'isomorphic-style-loader',
                    {
                        loader: require.resolve('css-loader'),
                        options: {
                            modules: true,
                            localIdentName: '[name]-[local]-[hash:base64:5]',
                            importLoaders: 1
                        },

                    },
                    'sass-loader'
                ]
            }
        );
        config.plugins.push(
            new webpack.DefinePlugin({
                'process.env.ASSETS_MANIFEST': JSON.stringify(paths.appManifest),
                'process.env.PUBLIC_DIR': JSON.stringify(paths.build)
            }),
        );
    }

    return config;
}
