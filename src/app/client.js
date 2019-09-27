import BrowserRouter from 'react-router-dom/BrowserRouter';
import React from 'react';
import {hydrate} from 'react-dom';
import {Provider} from 'react-redux';

import IndexApp from './containers';

import store, { history } from './client-store';

hydrate(
    <Provider store={store}>
        <BrowserRouter history={history}>
            <IndexApp />
         </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

if (module && module.hot) {
    module.hot.accept();
}

