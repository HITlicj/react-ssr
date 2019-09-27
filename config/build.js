const fs = require('fs-extra');
const createWebpackConfig = require('./createWebpackConfig');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const chalk = require('chalk');
const paths = require('./paths');
const webpack = require('webpack');

fs.emptyDirSync(paths.build);

copyPublicFolder();

// Helper function to copy public directory to build/public
function copyPublicFolder() {
    fs.copySync(paths.static, paths.buildStatic, {
        dereference: true,
        filter: file => file !== paths.appHtml,
    });
}

// 利用createWebpackConfig生成对应的webpack config
let clientConfig = createWebpackConfig('web', 'production');
let serverConfig = createWebpackConfig('node', 'production');

new Promise((resolve, reject) => {
    compile(clientConfig, (err, clientStats) => {
        if (err) {
            reject(err);
        }
        console.log(clientStats.toString({
            chunks: false,  // 使构建过程更静默无输出
            colors: true    // 在控制台展示颜色
          }));
        const clientMessages = formatWebpackMessages(
            clientStats.toJson({}, true)
        );
        if (clientMessages.errors.length) {
            return reject(new Error(clientMessages.errors.join('\n\n')));
        }

        console.log(chalk.green('Compiled client successfully.'));
        console.log('Compiling server...');
        compile(serverConfig, (err, serverStats) => {
            if (err) {
                reject(err);
            }
            console.log(serverStats.toString({
                chunks: false,  // 使构建过程更静默无输出
                colors: true    // 在控制台展示颜色
            }));
            const serverMessages = formatWebpackMessages(
                serverStats.toJson({}, true)
            );
            if (serverMessages.errors.length) {
                return reject(new Error(serverMessages.errors.join('\n\n')));
            }
            console.log(chalk.green('Compiled server successfully.'));
            return resolve({
                stats: clientStats,
                warnings: Object.assign(
                    {},
                    clientMessages.warnings,
                    serverMessages.warnings
                ),
            });
        });
    });
});

// Wrap webpack compile in a try catch.
function compile(config, cb) {
    let compiler;
    try {
        compiler = webpack(config);
    } catch (e) {
        printErrors('Failed to compile.', [e]);
        process.exit(1);
    }
    compiler.run((err, stats) => {
        cb(err, stats);
    });
}