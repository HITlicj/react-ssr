
const path = require('path');
const fs = require('fs');
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
    rootPath: path.resolve(appDirectory, '.'),
    build: path.resolve(appDirectory, 'build'),
    buildStatic: path.resolve(appDirectory, 'build/static'),
    static: path.resolve(appDirectory, 'static'),
    src: path.resolve(appDirectory, 'src'),
    scss: path.resolve(appDirectory, 'src/app/assets/scss'),
    app: path.resolve(appDirectory, 'src/app'),
    appManifest: path.resolve(appDirectory, 'build/assets.json'),
    appServerIndexJs: path.resolve(appDirectory, 'src/app/index'),
    appClientIndexJs: path.resolve(appDirectory, 'src/app/client'),
    
    template: path.resolve(appDirectory, 'config/template'),
    server: path.resolve(appDirectory, 'src/server'),
}