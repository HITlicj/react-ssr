import { applyMiddleware, createStore, compose } from 'redux'
import createHistory from 'history/createMemoryHistory';
import rootReducer from './reducers';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';

export const history = createHistory()

export const configureStore = function (history, initialState = {}) {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [];
  
  let storeEnhancers ;
  storeEnhancers = compose(
      applyMiddleware(...middlewares,sagaMiddleware)
  );

  const store = createStore(rootReducer, initialState, storeEnhancers);
  sagaMiddleware.run(rootSaga);
  // if (module.hot && process.env.NODE_ENV!=='production') {
  //     // Enable Webpack hot module replacement for reducers
  //     module.hot.accept( './reducers',() => {
  //         const nextRootReducer = require('./reducers/index');
  //         store.replaceReducer(nextRootReducer);
  //     });
  // }
  return store;
}

const store = configureStore(history)
export default store