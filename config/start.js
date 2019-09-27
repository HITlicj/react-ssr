const chalk = require('chalk');
let express = require('express');
let webpackDevMiddleware = require('webpack-dev-middleware');
let utils = require('./utils');
const paths = require('./paths');
const fs = require('fs-extra');
const webpack = require('webpack');
const config = require('./config.js');
const createWebpackConfig = require('./createWebpackConfig');
const proxy = require('http-proxy-middleware');

console.log(chalk.bgBlue('Compiling...'));

// Delete assets.json to always have a manifest up to date
fs.removeSync(paths.appManifest);

let app = express();

// Create dev configs using our config factory
let clientConfig = createWebpackConfig('web', 'development');
// console.log('clientConfig:', clientConfig);

let serverConfig = createWebpackConfig('node', 'development');
// console.log('serverConfig:', serverConfig);

// Compile our assets with webpack
const clientCompiler = compile(clientConfig);
const serverCompiler = compile(serverConfig);

// Start our server webpack instance in watch mode after assets compile
clientCompiler.plugin('done', () => {
    serverCompiler.watch(
        {
            quiet: true,
            stats: 'none',
        },
        /* eslint-disable no-unused-vars */
        stats => { }
    );
});

app.use('/', express.static(paths.static));
// 关键步骤 : 挂载 webpack dev middleware 进行资源监控 / 增量构建 / 加载支持
app.use(
    webpackDevMiddleware(clientCompiler, {
        // logLevel: logLevel === 'silent' ? 'error' : logLevel,
        // index: '/dist/index.html',
        // publicPath: clientConfig.output.publicPath,
        stats: {
            colors: true,
            context: process.cwd()
        }
    })
);

let webpackHotMiddleware = require('webpack-hot-middleware');
let hotMiddleware = webpackHotMiddleware(clientCompiler);
app.use(hotMiddleware);

const proxyOptions = {
    target: `http://localhost:${config.apiPort}`, // target host
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/',
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log('RAW Response from the target', JSON.stringify(proxyReq.headers, true, 2));
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log('RAW Response from the target', JSON.stringify(proxyRes.headers));
        // console.log('RAW res from the target', JSON.stringify(proxyRes.headers));
    }
}
app.use('/api/*', proxy(proxyOptions));

let httpServer = require('http').createServer(app);
let startServer = function () {
    httpServer.listen(config.port, function (err) {
        if (err) {
            console.error(err);
            utils.logs(['error: ' + err]);
        } else {
            utils.logs([
                'info: Server run on http://localhost:' + config.port
            ]);
        }
    });
};
startServer();

// Webpack compile in a try-catch
function compile(config) {
    let compiler;
    try {
        compiler = webpack(config);
    } catch (e) {
        printErrors('Failed to compile.', [e]);
        process.exit(1);
    }
    return compiler;
}

function printErrors(summary, errors) {
    console.log(chalk.red(summary));
    console.log();
    errors.forEach(err => {
        console.log(err.message || err);
        console.log();
    });
}