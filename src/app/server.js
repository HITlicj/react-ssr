import IndexApp from './containers';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import express from 'express';
import { Provider } from "react-redux";
import { renderToString } from 'react-dom/server';
const proxy = require('http-proxy-middleware');
import config from '../../config/config';
import paths from '../../config/paths';

import { matchRoutes, renderRoutes } from 'react-router-config';

// let store = configureStore(history, {});
import {configureStore, history} from './server-store';

const proxyOptions = {
  target: `http://localhost:${config.apiPort}`, // target host
  changeOrigin: true,
  cookieDomainRewrite: "localhost",
  pathRewrite: {
      '^/api': '/',
  },
  onProxyReq: (proxyReq, req, res) => {
      console.log('RAW Request from the target', JSON.stringify(proxyReq.headers));
      Object.keys(req.headers).forEach(function (key) {
        proxyReq.setHeader(key, req.headers[key]);
      });
  },
  onProxyRes: (proxyRes, req, res) => {
      console.log('RAW Response from the target', JSON.stringify(proxyRes.headers));
      // console.log('RAW res from the target', JSON.stringify(proxyRes.headers));
      Object.keys(proxyRes.headers).forEach(function (key) {
        res.append(key, proxyRes.headers[key]);
        console.log('key', key, 'proxyRes.headers[key]', proxyRes.headers[key]);
      });
  }
}

const assets = require(process.env.ASSETS_MANIFEST);
const server = express();
server
  .disable('x-powered-by')
  .use(express.static(process.env.PUBLIC_DIR))
  .use(express.static(paths.static))
  .use('/api/*', proxy(proxyOptions))
  .get('/*', async (req, res) => {
    const context = {};

    let preloadedState = {}

    let store = configureStore(history, preloadedState);

    // 处理服务器端获取数据
    const router = [];
    const branch = matchRoutes(router, req.url);
    const promises = branch.map(({route}) => {
        const fetch = route.component.fetch;
        return fetch instanceof Function ? fetch(store) : Promise.resolve(null)
    });
    await Promise.all(promises).catch((err)=>{
        console.log(err);
    }); 

    const markup = renderToString(
      <Provider store={store}>
        <StaticRouter context={context} location={req.url}>
          <IndexApp />
        </StaticRouter>
      </Provider>
    );

    if (context.url) {
      res.redirect(301, context.url);
    } else {
      res.status(200).send(
        `<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charset="utf-8" />
        <title>Welcome to Rose</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${
            assets.client.css
            ? `<link rel="stylesheet" href="${assets.client.css}">`
            : ''
        }
        ${
            process.env.NODE_ENV === 'production'
            ? `<script src="${assets.client.js}" defer></script>`
            : `<script src="${assets.client.js}" defer crossorigin></script>`
        }
    </head>
    <body>
        <div id="root">${markup}</div>
        <script>
            window.__PRELOADED_STATE__ = ${JSON.stringify(store.getState())};
        </script>
    </body>
</html>`
      );
    }
  });

export default server;
